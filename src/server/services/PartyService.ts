import { OnStart, Service } from "@flamework/core";
import { MemoryStoreService, Players } from "@rbxts/services";
import { Events } from "server/network";
import {
	MEMORY_KEYS,
	MEMORY_TTL_SECONDS,
	NEEDED_CLASS_XP_BONUS_PCT,
	PRE_MATCH_COUNTDOWN_SECONDS,
	REQUESTED_CLASS_XP_BONUS_PCT,
} from "shared/constants/party";
import { getPlaceKey } from "shared/constants/places";
import { CLASS_IDS, ClassId } from "shared/types/Class";
import { PARTY_CODE_LENGTH, PARTY_MAX_SIZE, PartyState, PreMatchReward } from "shared/types/Party";
import { RateLimiter } from "./RateLimiter";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Crockford-ish: no I, O, 0, 1
const MAX_COLLISION_RETRIES = 6;

export type LaunchListener = (code: string) => void;

@Service()
export class PartyService implements OnStart {
	private partyStore = MemoryStoreService.GetHashMap("oath_parties");
	private partyByUser = new Map<number, string>();
	private localParties = new Map<string, PartyState>();
	private launchListeners = new Array<LaunchListener>();

	constructor(private readonly rateLimiter: RateLimiter) {}

	onStart() {
		if (getPlaceKey(game.PlaceId) !== "hub") return;

		Events.createParty.connect((player) => this.handleCreate(player));
		Events.joinParty.connect((player, code) => this.handleJoin(player, code));
		Events.leaveParty.connect((player) => this.handleLeave(player));
		Events.toggleReady.connect((player) => this.handleToggleReady(player));
		Events.pickClass.connect((player, classId) => this.handlePickClass(player, classId));
		Events.requestClass.connect((player, classId) => this.handleRequestClass(player, classId));

		Players.PlayerRemoving.Connect((player) => this.handleLeave(player));

		task.spawn(() => this.countdownLoop());
	}

	onLaunchReady(listener: LaunchListener): () => void {
		this.launchListeners.push(listener);
		return () => {
			this.launchListeners = this.launchListeners.filter((l) => l !== listener);
		};
	}

	getParty(code: string): PartyState | undefined {
		return this.localParties.get(code);
	}

	markLaunching(code: string) {
		const state = this.localParties.get(code);
		if (!state) return;
		state.phase = "launching";
		this.broadcast(state);
	}

	disbandAfterLaunch(code: string) {
		const state = this.localParties.get(code);
		if (!state) return;
		for (const m of state.members) this.partyByUser.delete(m.userId);
		this.localParties.delete(code);
		task.spawn(() => this.releaseCode(code));
	}

	private handleCreate(player: Player) {
		if (!this.rateLimiter.allow(player.UserId, "createParty")) return;
		if (this.partyByUser.has(player.UserId)) {
			Events.partyError.fire(player, "You are already in a party.");
			return;
		}

		let code: string | undefined;
		for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
			const candidate = this.generateCode();
			const reserved = this.tryReserveCode(candidate, player.UserId);
			if (reserved) {
				code = candidate;
				break;
			}
		}

		if (code === undefined) {
			Events.partyError.fire(player, "Could not allocate a party code. Try again.");
			return;
		}

		const state: PartyState = {
			code,
			leaderUserId: player.UserId,
			members: [{ userId: player.UserId, displayName: player.DisplayName, ready: false }],
			requestedClasses: [],
			phase: "forming",
			countdownEndsAt: 0,
		};
		this.localParties.set(code, state);
		this.partyByUser.set(player.UserId, code);
		this.broadcast(state);
	}

	private handleJoin(player: Player, rawCode: string) {
		if (!this.rateLimiter.allow(player.UserId, "joinParty")) return;
		if (this.partyByUser.has(player.UserId)) {
			Events.partyError.fire(player, "Leave your current party first.");
			return;
		}
		const code = normaliseCode(rawCode);
		if (code === undefined) {
			Events.partyError.fire(player, "Party codes are 6 characters.");
			return;
		}
		const state = this.localParties.get(code);
		if (!state) {
			Events.partyError.fire(player, "No party with that code on this server yet.");
			return;
		}
		if (state.phase !== "forming") {
			Events.partyError.fire(player, "Party already launching.");
			return;
		}
		if (state.members.size() >= PARTY_MAX_SIZE) {
			Events.partyError.fire(player, "Party is full.");
			return;
		}
		if (state.members.some((m) => m.userId === player.UserId)) return;

		state.members.push({ userId: player.UserId, displayName: player.DisplayName, ready: false });
		this.partyByUser.set(player.UserId, code);
		this.broadcast(state);
	}

	private handleLeave(player: Player) {
		const code = this.partyByUser.get(player.UserId);
		if (code === undefined) return;
		const state = this.localParties.get(code);
		this.partyByUser.delete(player.UserId);
		if (!state) return;

		state.members = state.members.filter((m) => m.userId !== player.UserId);
		state.requestedClasses = [];

		if (state.members.size() === 0) {
			this.localParties.delete(code);
			task.spawn(() => this.releaseCode(code));
			return;
		}

		if (state.leaderUserId === player.UserId) {
			state.leaderUserId = state.members[0].userId;
		}
		if (state.phase === "preMatch") {
			state.phase = "forming";
			state.countdownEndsAt = 0;
		}
		this.broadcast(state);
	}

	private handleToggleReady(player: Player) {
		if (!this.rateLimiter.allow(player.UserId, "toggleReady")) return;
		const state = this.partyOf(player);
		if (!state) return;
		if (state.phase !== "forming") return;

		const me = state.members.find((m) => m.userId === player.UserId);
		if (!me) return;
		me.ready = !me.ready;

		const everyoneReady = state.members.every((m) => m.ready);
		if (everyoneReady && state.members.size() >= 1) {
			state.phase = "preMatch";
			state.countdownEndsAt = os.time() + PRE_MATCH_COUNTDOWN_SECONDS;
			this.broadcastPreMatchRewards(state);
		}
		this.broadcast(state);
	}

	private handlePickClass(player: Player, classId: ClassId) {
		if (!this.rateLimiter.allow(player.UserId, "pickClass")) return;
		if (!CLASS_IDS.includes(classId)) return;
		const state = this.partyOf(player);
		if (!state) return;
		if (state.phase !== "preMatch") return;

		const me = state.members.find((m) => m.userId === player.UserId);
		if (!me) return;
		me.pickedClass = classId;
		state.requestedClasses = state.requestedClasses.filter((c) => c !== classId);
		this.broadcastPreMatchRewards(state);
		this.broadcast(state);
	}

	private handleRequestClass(player: Player, classId: ClassId) {
		if (!this.rateLimiter.allow(player.UserId, "requestClass")) return;
		if (!CLASS_IDS.includes(classId)) return;
		const state = this.partyOf(player);
		if (!state) return;
		if (state.phase !== "preMatch") return;

		const alreadyPicked = state.members.some((m) => m.pickedClass === classId);
		if (alreadyPicked) return;
		if (state.requestedClasses.includes(classId)) return;
		state.requestedClasses.push(classId);
		this.broadcastPreMatchRewards(state);
		this.broadcast(state);
	}

	private countdownLoop() {
		for (;;) {
			task.wait(0.5);
			const now = os.time();
			for (const [code, state] of this.localParties) {
				if (state.phase === "preMatch" && state.countdownEndsAt > 0 && now >= state.countdownEndsAt) {
					state.phase = "launching";
					this.broadcast(state);
					for (const listener of this.launchListeners) {
						task.spawn(() => listener(code));
					}
				}
			}
		}
	}

	private broadcast(state: PartyState) {
		for (const member of state.members) {
			const player = Players.GetPlayerByUserId(member.userId);
			if (player) Events.partyUpdated.fire(player, state);
		}
	}

	private broadcastPreMatchRewards(state: PartyState) {
		const rewards = computeRewards(state);
		for (const m of state.members) {
			const player = Players.GetPlayerByUserId(m.userId);
			if (player) Events.preMatchRewards.fire(player, rewards);
		}
	}

	private partyOf(player: Player): PartyState | undefined {
		const code = this.partyByUser.get(player.UserId);
		return code !== undefined ? this.localParties.get(code) : undefined;
	}

	private tryReserveCode(code: string, leaderUserId: number): boolean {
		const [ok] = pcall(() =>
			this.partyStore.SetAsync(MEMORY_KEYS.party(code), leaderUserId, MEMORY_TTL_SECONDS.party),
		);
		return ok;
	}

	private releaseCode(code: string) {
		pcall(() => this.partyStore.RemoveAsync(MEMORY_KEYS.party(code)));
	}

	private generateCode(): string {
		let out = "";
		for (let i = 0; i < PARTY_CODE_LENGTH; i++) {
			const idx = math.random(1, CODE_ALPHABET.size());
			out += CODE_ALPHABET.sub(idx, idx);
		}
		return out;
	}
}

function normaliseCode(raw: string): string | undefined {
	const [trimmed] = raw.upper().gsub("[^A-Z0-9]", "");
	if (trimmed.size() !== PARTY_CODE_LENGTH) return undefined;
	return trimmed;
}

function computeRewards(state: PartyState): PreMatchReward[] {
	const picked = new Set<ClassId>();
	for (const m of state.members) if (m.pickedClass !== undefined) picked.add(m.pickedClass);

	const rewards: PreMatchReward[] = [];
	const seen = new Set<ClassId>();

	for (const classId of state.requestedClasses) {
		if (picked.has(classId)) continue;
		if (seen.has(classId)) continue;
		rewards.push({ classId, xpBonusPct: REQUESTED_CLASS_XP_BONUS_PCT, reason: "requested" });
		seen.add(classId);
	}

	let autoRemaining = 2;
	for (const classId of CLASS_IDS) {
		if (autoRemaining <= 0) break;
		if (picked.has(classId)) continue;
		if (seen.has(classId)) continue;
		rewards.push({ classId, xpBonusPct: NEEDED_CLASS_XP_BONUS_PCT, reason: "auto-needed" });
		seen.add(classId);
		autoRemaining -= 1;
	}

	return rewards;
}

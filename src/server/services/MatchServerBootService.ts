import { OnStart, Service } from "@flamework/core";
import { HttpService, MemoryStoreService, Players, TeleportService } from "@rbxts/services";
import { Events } from "server/network";
import { MEMORY_KEYS } from "shared/constants/party";
import { PLACES, getPlaceKey } from "shared/constants/places";
import { ClassId } from "shared/types/Class";
import { RateLimiter } from "./RateLimiter";

interface MatchHandoff {
	partyCode: string;
	expectedUserIds: number[];
	classAssignments: Array<{ userId: number; classId: ClassId }>;
	leaderUserId: number;
	createdAt: number;
}

@Service()
export class MatchServerBootService implements OnStart {
	private matchStore: MemoryStoreHashMap | undefined;
	private handoff?: MatchHandoff;
	private classByUserId = new Map<number, ClassId>();

	constructor(private readonly rateLimiter: RateLimiter) {}

	onStart() {
		if (getPlaceKey(game.PlaceId) !== "match") return;

		const [ok, store] = pcall(() => MemoryStoreService.GetHashMap("oath_matches"));
		if (ok) {
			this.matchStore = store as MemoryStoreHashMap;
		} else {
			warn(`[MatchBoot] MemoryStore unavailable: ${store}`);
			return;
		}

		this.loadHandoff();

		Players.PlayerAdded.Connect((player) => task.spawn(() => this.onPlayerAdded(player)));
		for (const p of Players.GetPlayers()) task.spawn(() => this.onPlayerAdded(p));

		Events.endMatch.connect((player) => this.handleEndMatch(player));

		// Auto-shutdown after last player leaves
		Players.PlayerRemoving.Connect(() => {
			task.wait(5);
			if (Players.GetPlayers().size() === 0) {
				// Reserved server will naturally close; explicit return-to-lobby happens per-player.
			}
		});
	}

	private loadHandoff() {
		const privateServerId = game.PrivateServerId;
		if (privateServerId === "") {
			warn("[MatchBoot] not a reserved server — aborting");
			return;
		}

		// The matchmaker wrote MEMORY_KEYS.match(accessCode) — but the match server
		// doesn't know its own accessCode directly. We use the ReservedServerAccessCode
		// passed via TeleportData as the lookup key, then cross-check UserIds.
		// We read the handoff from the first player's TeleportData (set by MatchmakingService).
	}

	private async onPlayerAdded(player: Player) {
		const joinData = player.GetJoinData();
		const teleportData = joinData.TeleportData as { partyCode?: string; accessCode?: string } | undefined;

		if (teleportData?.accessCode === undefined) {
			player.Kick("Missing match handoff data. Please rejoin via the Hub.");
			return;
		}

		if (this.handoff === undefined) {
			if (!this.matchStore) {
				player.Kick("Match roster unavailable — MemoryStore not ready.");
				return;
			}
			const [ok, payload] = pcall(() => this.matchStore!.GetAsync(MEMORY_KEYS.match(teleportData.accessCode!)));
			if (!ok || payload === undefined || !typeIs(payload, "string")) {
				player.Kick("Match roster not found. Please rejoin via the Hub.");
				return;
			}
			const [decodeOk, decoded] = pcall(() => HttpService.JSONDecode(payload as string));
			if (!decodeOk) {
				player.Kick("Match roster corrupted. Please rejoin via the Hub.");
				return;
			}
			this.handoff = decoded as MatchHandoff;
			for (const assignment of this.handoff.classAssignments) {
				this.classByUserId.set(assignment.userId, assignment.classId);
			}
		}

		if (!this.handoff.expectedUserIds.includes(player.UserId)) {
			player.Kick("You are not in this match roster.");
			return;
		}

		const classId = this.classByUserId.get(player.UserId) ?? "assault";
		Events.matchJoined.fire(player, { classId });
	}

	private handleEndMatch(player: Player) {
		if (!this.rateLimiter.allow(player.UserId, "endMatch")) return;

		const [ok, result] = pcall(() => TeleportService.Teleport(PLACES.hub, player));
		if (!ok) {
			warn(`[MatchBoot] failed to teleport ${player.Name} back to hub: ${result}`);
		}
	}
}

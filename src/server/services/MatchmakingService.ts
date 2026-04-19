import { OnStart, Service } from "@flamework/core";
import { HttpService, MemoryStoreService, Players, TeleportService } from "@rbxts/services";
import { Events } from "server/network";
import { MEMORY_KEYS, MEMORY_TTL_SECONDS } from "shared/constants/party";
import { PLACES, getPlaceKey } from "shared/constants/places";
import { ClassId } from "shared/types/Class";
import { PartyState } from "shared/types/Party";
import { PartyService } from "./PartyService";

interface MatchHandoff {
	partyCode: string;
	expectedUserIds: number[];
	classAssignments: Array<{ userId: number; classId: ClassId }>;
	leaderUserId: number;
	createdAt: number;
}

const MAX_TELEPORT_RETRIES = 3;
const TELEPORT_RETRY_BACKOFF_SEC = 2;

@Service()
export class MatchmakingService implements OnStart {
	private matchStore: MemoryStoreHashMap | undefined;

	constructor(private readonly partyService: PartyService) {}

	onStart() {
		if (getPlaceKey(game.PlaceId) !== "hub") return;

		const [ok, store] = pcall(() => MemoryStoreService.GetHashMap("oath_matches"));
		if (ok) {
			this.matchStore = store as MemoryStoreHashMap;
		} else {
			warn(`[Matchmaking] MemoryStore unavailable: ${store}`);
		}

		this.partyService.onLaunchReady((code) => this.launch(code));

		TeleportService.TeleportInitFailed.Connect((player, result, _errorMessage, _placeId, options) => {
			this.handleTeleportFailure(player, result, options);
		});
	}

	private async launch(code: string) {
		const state = this.partyService.getParty(code);
		if (!state) return;

		this.partyService.markLaunching(code);

		const classAssignments: Array<{ userId: number; classId: ClassId }> = [];
		for (const member of state.members) {
			classAssignments.push({ userId: member.userId, classId: member.pickedClass ?? "assault" });
		}

		const [reserveOk, reserveResult] = pcall(() => TeleportService.ReserveServer(PLACES.match));
		if (!reserveOk || typeIs(reserveResult, "string")) {
			this.abortLaunch(state, "Failed to reserve match server. Try again.");
			return;
		}
		const [accessCode] = reserveResult as LuaTuple<[string, string]>;

		const handoff: MatchHandoff = {
			partyCode: code,
			expectedUserIds: state.members.map((m) => m.userId),
			classAssignments,
			leaderUserId: state.leaderUserId,
			createdAt: os.time(),
		};

		if (!this.matchStore) {
			this.abortLaunch(state, "MemoryStore unavailable — cannot launch.");
			return;
		}
		const payload = HttpService.JSONEncode(handoff);
		const [writeOk] = pcall(() =>
			this.matchStore!.SetAsync(MEMORY_KEYS.match(accessCode), payload, MEMORY_TTL_SECONDS.match),
		);
		if (!writeOk) {
			this.abortLaunch(state, "Failed to write match roster. Try again.");
			return;
		}

		const players: Player[] = [];
		for (const member of state.members) {
			const p = Players.GetPlayerByUserId(member.userId);
			if (p !== undefined) players.push(p);
		}

		if (players.size() === 0) {
			this.abortLaunch(state, "No players online to teleport.");
			return;
		}

		const options = new Instance("TeleportOptions");
		options.ReservedServerAccessCode = accessCode;
		options.ShouldReserveServer = false;
		options.SetTeleportData({ partyCode: code, accessCode });

		const [teleportOk] = pcall(() => TeleportService.TeleportAsync(PLACES.match, players, options));
		if (!teleportOk) {
			this.abortLaunch(state, "Teleport failed. Try again.");
			return;
		}

		this.partyService.disbandAfterLaunch(code);
	}

	private abortLaunch(state: PartyState, message: string) {
		warn(`[Matchmaking] ${message} (party ${state.code})`);
		for (const member of state.members) {
			const player = Players.GetPlayerByUserId(member.userId);
			if (player) Events.partyError.fire(player, message);
		}
		state.phase = "forming";
		state.countdownEndsAt = 0;
		for (const m of state.members) m.ready = false;
		for (const member of state.members) {
			const player = Players.GetPlayerByUserId(member.userId);
			if (player) Events.partyUpdated.fire(player, state);
		}
	}

	private handleTeleportFailure(player: Player, result: Enum.TeleportResult, options: TeleportOptions) {
		warn(`[Matchmaking] teleport init failed for ${player.Name}: ${result.Name}`);
		const retryCountAttr = (player.GetAttribute("OathTeleportRetries") as number | undefined) ?? 0;
		if (retryCountAttr >= MAX_TELEPORT_RETRIES) {
			player.SetAttribute("OathTeleportRetries", undefined);
			return;
		}
		player.SetAttribute("OathTeleportRetries", retryCountAttr + 1);
		task.delay(TELEPORT_RETRY_BACKOFF_SEC * math.pow(2, retryCountAttr), () => {
			if (!player.IsDescendantOf(Players)) return;
			pcall(() => TeleportService.TeleportAsync(PLACES.match, [player], options));
		});
	}
}

import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import { PlayerDataService } from "./PlayerDataService";
import { RateLimiter } from "./RateLimiter";

@Service()
export class CharacterCreatorService implements OnStart {
	constructor(private readonly playerData: PlayerDataService, private readonly rateLimiter: RateLimiter) {}

	onStart() {
		Events.confirmCharacterCreated.connect((player) => this.handleConfirm(player));

		Players.PlayerAdded.Connect((player) => task.spawn(() => this.sendProfileWhenReady(player)));
		for (const player of Players.GetPlayers()) {
			task.spawn(() => this.sendProfileWhenReady(player));
		}
	}

	private sendProfileWhenReady(player: Player) {
		const deadline = os.clock() + 30;
		while (!this.playerData.isLoaded(player)) {
			if (!player.IsDescendantOf(Players)) return;
			if (os.clock() > deadline) {
				warn(`[CharacterCreator] profile load timeout for ${player.Name}`);
				return;
			}
			task.wait(0.1);
		}
		const data = this.playerData.get(player);
		if (!data) return;
		Events.profileLoaded.fire(player, {
			hasCompletedCreator: data.hasCompletedCreator,
			appearance: data.appearance,
		});
	}

	private handleConfirm(player: Player) {
		if (!this.rateLimiter.allow(player.UserId, "confirmCharacterCreated")) {
			warn(`[CharacterCreator] rate limit hit for ${player.Name}`);
			return;
		}
		if (!this.playerData.isLoaded(player)) {
			warn(`[CharacterCreator] confirm before profile loaded for ${player.Name}`);
			return;
		}
		const updated = this.playerData.markCreatorCompleted(player);
		if (!updated) return;
		Events.profileUpdated.fire(player, { hasCompletedCreator: true });
	}
}

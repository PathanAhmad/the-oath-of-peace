import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import {
	Appearance,
	HAIR_OPTIONS,
	PANTS_OPTIONS,
	SHIRT_OPTIONS,
	SKIN_TONES,
	SkinToneId,
	resolveAsset,
} from "shared/types/Appearance";
import { PlayerDataService } from "./PlayerDataService";
import { RateLimiter } from "./RateLimiter";

@Service()
export class AppearanceService implements OnStart {
	constructor(private readonly playerData: PlayerDataService, private readonly rateLimiter: RateLimiter) {}

	onStart() {
		// Override Roblox's default avatar pipeline. We assemble characters ourselves.
		Players.CharacterAutoLoads = false;

		Players.PlayerAdded.Connect((player) => task.spawn(() => this.onPlayerAdded(player)));
		for (const player of Players.GetPlayers()) {
			task.spawn(() => this.onPlayerAdded(player));
		}

		Events.saveAppearance.connect((player, appearance) => this.handleSave(player, appearance));
	}

	private async onPlayerAdded(player: Player) {
		const deadline = os.clock() + 30;
		while (!this.playerData.isLoaded(player)) {
			if (!player.IsDescendantOf(Players)) return;
			if (os.clock() > deadline) {
				warn(`[Appearance] profile load timeout for ${player.Name}`);
				return;
			}
			task.wait(0.1);
		}

		this.respawnWithAppearance(player);
	}

	private respawnWithAppearance(player: Player) {
		const data = this.playerData.get(player);
		if (!data) return;

		const description = this.buildDescription(data.appearance);
		const [ok, err] = pcall(() => player.LoadCharacterWithHumanoidDescription(description));
		if (!ok) {
			warn(`[Appearance] LoadCharacterWithHumanoidDescription failed for ${player.Name}: ${err}`);
			// Fallback: at least spawn them so they're not stuck disembodied.
			pcall(() => player.LoadCharacter());
		}
	}

	private handleSave(player: Player, appearance: Appearance) {
		if (!this.rateLimiter.allow(player.UserId, "saveAppearance")) return;
		const sanitised = this.sanitise(appearance);
		if (!sanitised) {
			warn(`[Appearance] rejected invalid appearance from ${player.Name}`);
			return;
		}
		if (!this.playerData.setAppearance(player, sanitised)) return;

		this.respawnWithAppearance(player);

		const data = this.playerData.get(player);
		if (data) Events.appearanceUpdated.fire(player, data.appearance);
	}

	private sanitise(a: Appearance): Appearance | undefined {
		const hair = resolveAsset(HAIR_OPTIONS, a.hairId);
		const shirt = resolveAsset(SHIRT_OPTIONS, a.shirtId);
		const pants = resolveAsset(PANTS_OPTIONS, a.pantsId);
		if (!hair || !shirt || !pants) return undefined;
		const skinOk = a.skinToneId in SKIN_TONES;
		if (!skinOk) return undefined;
		return {
			hairId: hair.id,
			shirtId: shirt.id,
			pantsId: pants.id,
			skinToneId: a.skinToneId as SkinToneId,
		};
	}

	private buildDescription(a: Appearance): HumanoidDescription {
		const desc = new Instance("HumanoidDescription");

		const hair = resolveAsset(HAIR_OPTIONS, a.hairId) ?? HAIR_OPTIONS[0];
		const shirt = resolveAsset(SHIRT_OPTIONS, a.shirtId) ?? SHIRT_OPTIONS[0];
		const pants = resolveAsset(PANTS_OPTIONS, a.pantsId) ?? PANTS_OPTIONS[0];

		desc.HairAccessory = tostring(hair.assetId);
		desc.Shirt = shirt.assetId;
		desc.Pants = pants.assetId;

		const skin = SKIN_TONES[a.skinToneId] ?? SKIN_TONES.tan;
		desc.HeadColor = skin;
		desc.LeftArmColor = skin;
		desc.RightArmColor = skin;
		desc.TorsoColor = skin;
		desc.LeftLegColor = skin;
		desc.RightLegColor = skin;

		return desc;
	}
}

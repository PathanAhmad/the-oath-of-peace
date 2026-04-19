import { OnInit, Service } from "@flamework/core";
import ProfileStore from "@rbxts/profile-store";
import { Players, RunService } from "@rbxts/services";
import { PROFILE_TEMPLATE_V1, ProfileDataV1 } from "shared/types/Profile";

const STORE_NAME = "PlayerData_v1";

type ProfileInstance = ReturnType<typeof ProfileStore.New<ProfileDataV1>>["StartSessionAsync"] extends (
	...args: never[]
) => infer R
	? R
	: never;

@Service()
export class PlayerDataService implements OnInit {
	private store = RunService.IsStudio()
		? ProfileStore.New(STORE_NAME, PROFILE_TEMPLATE_V1).Mock
		: ProfileStore.New(STORE_NAME, PROFILE_TEMPLATE_V1);

	private profiles = new Map<Player, ProfileInstance>();

	onInit() {
		Players.PlayerAdded.Connect((player) => this.loadProfile(player));
		Players.PlayerRemoving.Connect((player) => this.releaseProfile(player));
		for (const player of Players.GetPlayers()) {
			task.spawn(() => this.loadProfile(player));
		}
	}

	private loadProfile(player: Player) {
		const profile = this.store.StartSessionAsync(`user_${player.UserId}`, {
			Cancel: () => !player.IsDescendantOf(Players),
		});

		if (profile === undefined) {
			player.Kick("Failed to load your profile. Please rejoin.");
			return;
		}

		profile.AddUserId(player.UserId);
		profile.Reconcile();

		profile.OnSessionEnd.Connect(() => {
			this.profiles.delete(player);
			player.Kick("Profile session ended. Please rejoin.");
		});

		if (!player.IsDescendantOf(Players)) {
			profile.EndSession();
			return;
		}

		const now = os.time();
		if (profile.Data.createdAt === 0) profile.Data.createdAt = now;
		profile.Data.lastLogin = now;
		profile.Data.sessionsStarted += 1;

		this.profiles.set(player, profile);
	}

	private releaseProfile(player: Player) {
		const profile = this.profiles.get(player);
		if (profile) profile.EndSession();
	}

	get(player: Player): ProfileDataV1 | undefined {
		return this.profiles.get(player)?.Data;
	}

	isLoaded(player: Player): boolean {
		return this.profiles.has(player);
	}

	markCreatorCompleted(player: Player): boolean {
		const profile = this.profiles.get(player);
		if (!profile || !profile.IsActive()) return false;
		if (profile.Data.hasCompletedCreator) return false;
		profile.Data.hasCompletedCreator = true;
		return true;
	}
}

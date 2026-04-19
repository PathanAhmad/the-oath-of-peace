import { Controller, OnStart } from "@flamework/core";
import Roact from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { Events } from "client/network";
import { CharacterCreatorApp } from "client/ui/CharacterCreatorApp";
import { HubApp } from "client/ui/HubApp";
import { MatchApp } from "client/ui/MatchApp";
import { PreMatchLoadoutApp } from "client/ui/PreMatchLoadoutApp";
import { getPlaceKey } from "shared/constants/places";
import { Appearance, DEFAULT_APPEARANCE } from "shared/types/Appearance";
import { ClassId } from "shared/types/Class";
import { PartyState, PreMatchReward } from "shared/types/Party";

type HubScreen =
	| { kind: "loading" }
	| { kind: "creator"; isFirstTime: boolean }
	| { kind: "hub"; party: PartyState | undefined; error?: string; rewards: PreMatchReward[] };

type MatchScreen = { kind: "loading" } | { kind: "match"; classId: ClassId };

@Controller()
export class UiController implements OnStart {
	private root = createRoot(new Instance("Folder"));

	private hubScreen: HubScreen = { kind: "loading" };
	private matchScreen: MatchScreen = { kind: "loading" };

	private party: PartyState | undefined;
	private rewards: PreMatchReward[] = [];
	private lastError?: string;
	private errorClearThread?: thread;
	private appearance: Appearance = DEFAULT_APPEARANCE;

	onStart() {
		print("[Oath] UiController mounting");
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const screenGui = new Instance("ScreenGui");
		screenGui.Name = "OathUi";
		screenGui.ResetOnSpawn = false;
		screenGui.IgnoreGuiInset = true;
		screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		screenGui.Parent = playerGui;

		const placeKey = getPlaceKey(game.PlaceId);

		if (placeKey === "match") {
			this.bindMatchEvents();
		} else {
			this.bindHubEvents();
		}

		this.render(screenGui, placeKey);
	}

	private bindHubEvents() {
		Events.profileLoaded.connect((profile) => {
			this.appearance = profile.appearance;
			this.hubScreen = profile.hasCompletedCreator
				? { kind: "hub", party: undefined, rewards: [] }
				: { kind: "creator", isFirstTime: true };
			this.rerender();
		});

		Events.profileUpdated.connect((profile) => {
			if (profile.hasCompletedCreator) {
				this.hubScreen = { kind: "hub", party: undefined, rewards: [] };
				this.rerender();
			}
		});

		Events.appearanceUpdated.connect((appearance) => {
			this.appearance = appearance;
			// If creator is open as "edit mode", switch back to hub.
			if (this.hubScreen.kind === "creator" && !this.hubScreen.isFirstTime) {
				this.hubScreen = { kind: "hub", party: undefined, rewards: this.rewards };
				this.rerender();
			}
		});

		Events.partyUpdated.connect((party) => {
			this.party = party;
			this.rewards = [];
			if (this.hubScreen.kind === "hub") {
				this.hubScreen = { kind: "hub", party, rewards: this.rewards, error: this.lastError };
				this.rerender();
			}
		});

		Events.preMatchRewards.connect((rewards) => {
			this.rewards = rewards;
			if (this.hubScreen.kind === "hub") {
				this.hubScreen = {
					kind: "hub",
					party: this.party,
					rewards,
					error: this.lastError,
				};
				this.rerender();
			}
		});

		Events.partyError.connect((message) => {
			this.showError(message);
		});
	}

	private bindMatchEvents() {
		Events.matchJoined.connect((info) => {
			this.matchScreen = { kind: "match", classId: info.classId };
			this.rerender();
		});
	}

	private showError(message: string) {
		this.lastError = message;
		if (this.hubScreen.kind === "hub") {
			this.hubScreen = {
				kind: "hub",
				party: this.party,
				rewards: this.rewards,
				error: message,
			};
			this.rerender();
		}
		if (this.errorClearThread !== undefined) task.cancel(this.errorClearThread);
		this.errorClearThread = task.delay(4, () => {
			this.lastError = undefined;
			if (this.hubScreen.kind === "hub") {
				this.hubScreen = { kind: "hub", party: this.party, rewards: this.rewards };
				this.rerender();
			}
		});
	}

	private openEditAppearance() {
		this.hubScreen = { kind: "creator", isFirstTime: false };
		this.rerender();
	}

	private closeEditAppearance() {
		this.hubScreen = { kind: "hub", party: this.party, rewards: this.rewards };
		this.rerender();
	}

	private rerender() {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const screenGui = playerGui.FindFirstChild("OathUi") as ScreenGui | undefined;
		if (!screenGui) return;
		this.render(screenGui, getPlaceKey(game.PlaceId));
	}

	private render(host: Instance, placeKey: ReturnType<typeof getPlaceKey>) {
		this.root.render(createPortal(this.renderScreen(placeKey), host));
	}

	private renderScreen(placeKey: ReturnType<typeof getPlaceKey>): Roact.Element {
		if (placeKey === "match") {
			if (this.matchScreen.kind === "loading") return <LoadingView label="Joining match…" />;
			return <MatchApp classId={this.matchScreen.classId} onEndMatch={() => Events.endMatch.fire()} />;
		}

		// Hub place
		if (this.hubScreen.kind === "loading") return <LoadingView label="Loading profile…" />;

		if (this.hubScreen.kind === "creator") {
			const isFirstTime = this.hubScreen.isFirstTime;
			return (
				<CharacterCreatorApp
					initial={this.appearance}
					isFirstTime={isFirstTime}
					onSave={(appearance) => {
						this.appearance = appearance;
						Events.saveAppearance.fire(appearance);
						if (isFirstTime) {
							Events.confirmCharacterCreated.fire();
						}
					}}
					onCancel={isFirstTime ? undefined : () => this.closeEditAppearance()}
				/>
			);
		}

		const party = this.hubScreen.party;
		if (party !== undefined && party.phase !== "forming") {
			return (
				<PreMatchLoadoutApp
					party={party}
					rewards={this.hubScreen.rewards}
					onPickClass={(c) => Events.pickClass.fire(c)}
					onRequestClass={(c) => Events.requestClass.fire(c)}
				/>
			);
		}

		return (
			<HubApp
				party={party}
				errorMessage={this.hubScreen.error}
				onCreateParty={() => Events.createParty.fire()}
				onJoinParty={(code) => Events.joinParty.fire(code)}
				onLeaveParty={() => Events.leaveParty.fire()}
				onToggleReady={() => Events.toggleReady.fire()}
				onEditAppearance={() => this.openEditAppearance()}
			/>
		);
	}
}

function LoadingView({ label }: { label: string }) {
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={Color3.fromRGB(8, 12, 24)} BorderSizePixel={0}>
			<textlabel
				Size={new UDim2(1, 0, 0, 40)}
				Position={new UDim2(0, 0, 0.5, -20)}
				BackgroundTransparency={1}
				Text={label}
				TextColor3={Color3.fromRGB(180, 195, 225)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>
		</frame>
	);
}

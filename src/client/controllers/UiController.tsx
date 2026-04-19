import { Controller, OnStart } from "@flamework/core";
import Roact from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { Events } from "client/network";
import { CharacterCreatorApp } from "client/ui/CharacterCreatorApp";
import { HubPlaceholderApp } from "client/ui/HubPlaceholderApp";

type Screen = "loading" | "creator" | "hub";

@Controller()
export class UiController implements OnStart {
	private root = createRoot(new Instance("Folder"));
	private screen: Screen = "loading";

	onStart() {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

		const screenGui = new Instance("ScreenGui");
		screenGui.Name = "OathUi";
		screenGui.ResetOnSpawn = false;
		screenGui.IgnoreGuiInset = true;
		screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
		screenGui.Parent = playerGui;

		this.render(screenGui);

		Events.profileLoaded.connect((profile) => {
			this.screen = profile.hasCompletedCreator ? "hub" : "creator";
			this.render(screenGui);
		});

		Events.profileUpdated.connect((profile) => {
			if (profile.hasCompletedCreator) {
				this.screen = "hub";
				this.render(screenGui);
			}
		});
	}

	private render(host: Instance) {
		this.root.render(createPortal(this.renderScreen(), host));
	}

	private renderScreen() {
		if (this.screen === "loading") return <LoadingView />;
		if (this.screen === "creator") return <CharacterCreatorApp onConfirm={() => Events.confirmCharacterCreated.fire()} />;
		return <HubPlaceholderApp />;
	}
}

function LoadingView() {
	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(8, 12, 24)}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 40)}
				Position={new UDim2(0, 0, 0.5, -20)}
				BackgroundTransparency={1}
				Text="Loading profile…"
				TextColor3={Color3.fromRGB(180, 195, 225)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>
		</frame>
	);
}

import { OnStart, Service } from "@flamework/core";
import { Lighting, Workspace } from "@rbxts/services";
import { getPlaceKey } from "shared/constants/places";

@Service()
export class WorldBootService implements OnStart {
	onStart() {
		const placeKey = getPlaceKey(game.PlaceId);
		print(`[WorldBoot] placeId=${game.PlaceId} key=${placeKey ?? "unknown"}`);

		this.ensureBaseplate(placeKey);
		this.ensureSpawn(placeKey);
		this.tuneLighting(placeKey);
	}

	private ensureBaseplate(placeKey: ReturnType<typeof getPlaceKey>) {
		if (Workspace.FindFirstChild("OathBaseplate") !== undefined) return;

		const baseplate = new Instance("Part");
		baseplate.Name = "OathBaseplate";
		baseplate.Anchored = true;
		baseplate.Size = new Vector3(512, 2, 512);
		baseplate.Position = new Vector3(0, -1, 0);
		baseplate.TopSurface = Enum.SurfaceType.Smooth;
		baseplate.BottomSurface = Enum.SurfaceType.Smooth;
		baseplate.Material = Enum.Material.Slate;
		baseplate.Color = placeKey === "match" ? Color3.fromRGB(60, 65, 75) : Color3.fromRGB(40, 55, 90);
		baseplate.Parent = Workspace;
	}

	private ensureSpawn(placeKey: ReturnType<typeof getPlaceKey>) {
		const existing = Workspace.FindFirstChildOfClass("SpawnLocation");
		if (existing !== undefined) return;

		const spawn = new Instance("SpawnLocation");
		spawn.Name = "OathSpawn";
		spawn.Anchored = true;
		spawn.Size = new Vector3(12, 1, 12);
		spawn.Position = new Vector3(0, 1, 0);
		spawn.TopSurface = Enum.SurfaceType.Smooth;
		spawn.BottomSurface = Enum.SurfaceType.Smooth;
		spawn.Material = Enum.Material.Neon;
		spawn.Color = placeKey === "match" ? Color3.fromRGB(220, 100, 100) : Color3.fromRGB(100, 180, 255);
		spawn.CanCollide = true;
		spawn.Transparency = 0;
		spawn.Parent = Workspace;

		// Decal on top so players can see which place they're on
		const label = new Instance("Part");
		label.Anchored = true;
		label.CanCollide = false;
		label.Transparency = 1;
		label.Size = new Vector3(12, 1, 12);
		label.Position = new Vector3(0, 1.6, 0);
		label.Parent = Workspace;

		const surfaceGui = new Instance("SurfaceGui");
		surfaceGui.Face = Enum.NormalId.Top;
		surfaceGui.CanvasSize = new Vector2(400, 200);
		surfaceGui.Parent = label;

		const textLabel = new Instance("TextLabel");
		textLabel.Size = new UDim2(1, 0, 1, 0);
		textLabel.BackgroundTransparency = 1;
		textLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
		textLabel.Text = placeKey === "match" ? "MATCH" : "HUB";
		textLabel.Font = Enum.Font.GothamBold;
		textLabel.TextScaled = true;
		textLabel.Parent = surfaceGui;
	}

	private tuneLighting(placeKey: ReturnType<typeof getPlaceKey>) {
		Lighting.Ambient = placeKey === "match" ? Color3.fromRGB(50, 40, 60) : Color3.fromRGB(40, 45, 70);
		Lighting.OutdoorAmbient = Color3.fromRGB(80, 85, 110);
	}
}

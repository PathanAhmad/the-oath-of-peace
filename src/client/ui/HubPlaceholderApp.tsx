import Roact from "@rbxts/react";

export function HubPlaceholderApp() {
	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(8, 12, 24)}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 80)}
				Position={new UDim2(0, 0, 0, 80)}
				BackgroundTransparency={1}
				Text="Hub (placeholder)"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 40)}
				Position={new UDim2(0, 0, 0, 170)}
				BackgroundTransparency={1}
				Text="Party system, pre-match loadout, and match launch land here."
				TextColor3={Color3.fromRGB(150, 165, 195)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>
		</frame>
	);
}

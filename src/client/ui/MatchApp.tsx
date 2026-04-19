import Roact from "@rbxts/react";
import { CLASS_DISPLAY_NAME, ClassId } from "shared/types/Class";

interface Props {
	classId: ClassId;
	onEndMatch: () => void;
}

export function MatchApp({ classId, onEndMatch }: Props) {
	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(10, 14, 22)}
			BackgroundTransparency={0.2}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 80)}
				Position={new UDim2(0, 0, 0, 80)}
				BackgroundTransparency={1}
				Text="MATCH IN PROGRESS"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 50)}
				Position={new UDim2(0, 0, 0, 170)}
				BackgroundTransparency={1}
				Text={`You are ${CLASS_DISPLAY_NAME[classId]}`}
				TextColor3={Color3.fromRGB(120, 200, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 30)}
				Position={new UDim2(0, 0, 0, 230)}
				BackgroundTransparency={1}
				Text="Real gameplay lands in Phase 2."
				TextColor3={Color3.fromRGB(150, 165, 195)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>
			<textbutton
				Size={new UDim2(0, 260, 0, 56)}
				Position={new UDim2(0.5, -130, 1, -120)}
				BackgroundColor3={Color3.fromRGB(80, 40, 40)}
				BorderSizePixel={0}
				Text="End Match → Hub"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				Event={{ Activated: () => onEndMatch() }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>
		</frame>
	);
}

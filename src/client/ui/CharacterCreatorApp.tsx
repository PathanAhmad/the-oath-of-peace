import Roact, { useState } from "@rbxts/react";
import {
	Appearance,
	AppearanceOption,
	HAIR_OPTIONS,
	PANTS_OPTIONS,
	SHIRT_OPTIONS,
	SKIN_TONES,
	SkinToneId,
} from "shared/types/Appearance";

interface Props {
	initial: Appearance;
	isFirstTime: boolean;
	onSave: (appearance: Appearance) => void;
	onCancel?: () => void;
}

const SKIN_TONE_IDS: readonly SkinToneId[] = ["pale", "tan", "brown", "dark"];

export function CharacterCreatorApp({ initial, isFirstTime, onSave, onCancel }: Props) {
	const [hairId, setHairId] = useState(initial.hairId);
	const [shirtId, setShirtId] = useState(initial.shirtId);
	const [pantsId, setPantsId] = useState(initial.pantsId);
	const [skinToneId, setSkinToneId] = useState<SkinToneId>(initial.skinToneId);
	const [saved, setSaved] = useState(false);

	const commit = () => {
		if (saved) return;
		setSaved(true);
		onSave({ hairId, shirtId, pantsId, skinToneId });
	};

	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={Color3.fromRGB(10, 14, 26)} BorderSizePixel={0}>
			<textlabel
				Size={new UDim2(1, 0, 0, 60)}
				Position={new UDim2(0, 0, 0, 24)}
				BackgroundTransparency={1}
				Text={isFirstTime ? "TAKE THE OATH" : "EDIT APPEARANCE"}
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 22)}
				Position={new UDim2(0, 0, 0, 88)}
				BackgroundTransparency={1}
				Text="Outfit your Guardian. Customize anytime from the Hub."
				TextColor3={Color3.fromRGB(170, 180, 210)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>

			<frame
				Size={new UDim2(0, 720, 0, 520)}
				Position={new UDim2(0.5, -360, 0, 130)}
				BackgroundTransparency={1}
			>
				<OptionRow
					label="HAIR"
					options={HAIR_OPTIONS}
					selected={hairId}
					onPick={setHairId}
					rowY={0}
				/>
				<OptionRow
					label="SHIRT"
					options={SHIRT_OPTIONS}
					selected={shirtId}
					onPick={setShirtId}
					rowY={120}
				/>
				<OptionRow
					label="PANTS"
					options={PANTS_OPTIONS}
					selected={pantsId}
					onPick={setPantsId}
					rowY={240}
				/>
				<SkinRow selected={skinToneId} onPick={setSkinToneId} rowY={360} />
			</frame>

			{onCancel !== undefined && (
				<textbutton
					Size={new UDim2(0, 180, 0, 48)}
					Position={new UDim2(0.5, -200, 1, -80)}
					BackgroundColor3={Color3.fromRGB(50, 54, 70)}
					BorderSizePixel={0}
					Text="Cancel"
					TextColor3={Color3.fromRGB(235, 240, 255)}
					TextScaled
					Font={Enum.Font.GothamBold}
					Event={{ Activated: () => onCancel() }}
				>
					<uicorner CornerRadius={new UDim(0, 8)} />
				</textbutton>
			)}

			<textbutton
				Size={new UDim2(0, 220, 0, 56)}
				Position={new UDim2(0.5, onCancel !== undefined ? 20 : -110, 1, -84)}
				BackgroundColor3={saved ? Color3.fromRGB(80, 80, 90) : Color3.fromRGB(60, 140, 90)}
				BorderSizePixel={0}
				Text={saved ? "Saving…" : isFirstTime ? "Deploy to Hub" : "Save"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				AutoButtonColor={!saved}
				Event={{ Activated: () => commit() }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>
		</frame>
	);
}

function OptionRow(props: {
	label: string;
	options: readonly AppearanceOption[];
	selected: string;
	onPick: (id: string) => void;
	rowY: number;
}) {
	return (
		<frame
			Size={new UDim2(1, 0, 0, 100)}
			Position={new UDim2(0, 0, 0, props.rowY)}
			BackgroundTransparency={1}
		>
			<textlabel
				Size={new UDim2(0, 100, 0, 20)}
				Position={new UDim2(0, 0, 0, 0)}
				BackgroundTransparency={1}
				Text={props.label}
				TextColor3={Color3.fromRGB(150, 160, 200)}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			{props.options.map((opt, i) => {
				const isSelected = opt.id === props.selected;
				return (
					<textbutton
						key={opt.id}
						Size={new UDim2(0, 130, 0, 70)}
						Position={new UDim2(0, i * 140, 0, 26)}
						BackgroundColor3={
							isSelected ? Color3.fromRGB(60, 110, 220) : Color3.fromRGB(22, 28, 46)
						}
						BorderSizePixel={0}
						Text={opt.label}
						TextColor3={Color3.fromRGB(235, 240, 255)}
						TextScaled
						Font={Enum.Font.Gotham}
						Event={{ Activated: () => props.onPick(opt.id) }}
					>
						<uicorner CornerRadius={new UDim(0, 6)} />
					</textbutton>
				);
			})}
		</frame>
	);
}

function SkinRow(props: {
	selected: SkinToneId;
	onPick: (id: SkinToneId) => void;
	rowY: number;
}) {
	return (
		<frame
			Size={new UDim2(1, 0, 0, 100)}
			Position={new UDim2(0, 0, 0, props.rowY)}
			BackgroundTransparency={1}
		>
			<textlabel
				Size={new UDim2(0, 100, 0, 20)}
				Position={new UDim2(0, 0, 0, 0)}
				BackgroundTransparency={1}
				Text="SKIN"
				TextColor3={Color3.fromRGB(150, 160, 200)}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			{SKIN_TONE_IDS.map((id, i) => {
				const isSelected = id === props.selected;
				return (
					<textbutton
						key={id}
						Size={new UDim2(0, 70, 0, 70)}
						Position={new UDim2(0, i * 80, 0, 26)}
						BackgroundColor3={SKIN_TONES[id]}
						BorderSizePixel={isSelected ? 4 : 0}
						BorderColor3={Color3.fromRGB(120, 200, 255)}
						Text=""
						Event={{ Activated: () => props.onPick(id) }}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						<uistroke
							Color={Color3.fromRGB(120, 200, 255)}
							Thickness={isSelected ? 3 : 0}
							Transparency={isSelected ? 0 : 1}
						/>
					</textbutton>
				);
			})}
		</frame>
	);
}

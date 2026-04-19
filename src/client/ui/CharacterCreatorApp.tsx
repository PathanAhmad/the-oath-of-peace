import Roact, { useState } from "@rbxts/react";

interface Props {
	onConfirm: () => void;
}

export function CharacterCreatorApp({ onConfirm }: Props) {
	const [showModal, setShowModal] = useState(false);
	const [confirmed, setConfirmed] = useState(false);

	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(12, 16, 28)}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 80)}
				Position={new UDim2(0, 0, 0, 60)}
				BackgroundTransparency={1}
				Text="THE OATH OF PEACE"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>

			<textlabel
				Size={new UDim2(1, 0, 0, 30)}
				Position={new UDim2(0, 0, 0, 150)}
				BackgroundTransparency={1}
				Text="Take the oath and join the Galactic Guardians."
				TextColor3={Color3.fromRGB(170, 180, 210)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>

			<textbutton
				Size={new UDim2(0, 280, 0, 60)}
				Position={new UDim2(0.5, -140, 1, -140)}
				BackgroundColor3={
					confirmed ? Color3.fromRGB(80, 80, 90) : Color3.fromRGB(60, 110, 220)
				}
				BorderSizePixel={0}
				Text={confirmed ? "Deploying…" : "Confirm"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				AutoButtonColor={!confirmed}
				Event={{
					Activated: () => {
						if (!confirmed) setShowModal(true);
					},
				}}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>

			{showModal && (
				<frame
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={0.45}
					BorderSizePixel={0}
					ZIndex={10}
				>
					<frame
						Size={new UDim2(0, 420, 0, 220)}
						Position={new UDim2(0.5, -210, 0.5, -110)}
						BackgroundColor3={Color3.fromRGB(24, 28, 44)}
						BorderSizePixel={0}
						ZIndex={11}
					>
						<uicorner CornerRadius={new UDim(0, 10)} />

						<textlabel
							Size={new UDim2(1, -40, 0, 40)}
							Position={new UDim2(0, 20, 0, 20)}
							BackgroundTransparency={1}
							Text="Begin your Oath"
							TextColor3={Color3.fromRGB(235, 240, 255)}
							TextScaled
							Font={Enum.Font.GothamBold}
							ZIndex={12}
						/>

						<textlabel
							Size={new UDim2(1, -40, 0, 40)}
							Position={new UDim2(0, 20, 0, 70)}
							BackgroundTransparency={1}
							Text="Your character is ready. Deploy to the Hub?"
							TextColor3={Color3.fromRGB(170, 180, 210)}
							TextScaled
							Font={Enum.Font.Gotham}
							ZIndex={12}
						/>

						<textbutton
							Size={new UDim2(0, 160, 0, 44)}
							Position={new UDim2(0, 20, 1, -64)}
							BackgroundColor3={Color3.fromRGB(50, 54, 70)}
							BorderSizePixel={0}
							Text="Cancel"
							TextColor3={Color3.fromRGB(235, 240, 255)}
							TextScaled
							Font={Enum.Font.GothamBold}
							ZIndex={12}
							Event={{ Activated: () => setShowModal(false) }}
						>
							<uicorner CornerRadius={new UDim(0, 6)} />
						</textbutton>

						<textbutton
							Size={new UDim2(0, 180, 0, 44)}
							Position={new UDim2(1, -200, 1, -64)}
							BackgroundColor3={Color3.fromRGB(60, 140, 90)}
							BorderSizePixel={0}
							Text="Deploy"
							TextColor3={Color3.fromRGB(255, 255, 255)}
							TextScaled
							Font={Enum.Font.GothamBold}
							ZIndex={12}
							Event={{
								Activated: () => {
									setConfirmed(true);
									setShowModal(false);
									onConfirm();
								},
							}}
						>
							<uicorner CornerRadius={new UDim(0, 6)} />
						</textbutton>
					</frame>
				</frame>
			)}
		</frame>
	);
}

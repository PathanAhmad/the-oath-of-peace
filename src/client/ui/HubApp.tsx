import Roact, { useState } from "@rbxts/react";
import { Players } from "@rbxts/services";
import { PARTY_MAX_SIZE, PartyState } from "shared/types/Party";

interface Props {
	party: PartyState | undefined;
	errorMessage?: string;
	onCreateParty: () => void;
	onJoinParty: (code: string) => void;
	onLeaveParty: () => void;
	onToggleReady: () => void;
}

export function HubApp({ party, errorMessage, onCreateParty, onJoinParty, onLeaveParty, onToggleReady }: Props) {
	const [joinCode, setJoinCode] = useState("");

	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(8, 12, 24)}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 60)}
				Position={new UDim2(0, 0, 0, 30)}
				BackgroundTransparency={1}
				Text="THE OATH — HUB"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>

			{party === undefined ? (
				<NoPartyPanel
					joinCode={joinCode}
					setJoinCode={setJoinCode}
					onCreateParty={onCreateParty}
					onJoinParty={onJoinParty}
				/>
			) : (
				<PartyPanel party={party} onLeaveParty={onLeaveParty} onToggleReady={onToggleReady} />
			)}

			{errorMessage !== undefined && (
				<textlabel
					Size={new UDim2(1, -40, 0, 30)}
					Position={new UDim2(0, 20, 1, -60)}
					BackgroundTransparency={1}
					Text={errorMessage}
					TextColor3={Color3.fromRGB(240, 120, 120)}
					TextScaled
					Font={Enum.Font.Gotham}
				/>
			)}
		</frame>
	);
}

function NoPartyPanel(props: {
	joinCode: string;
	setJoinCode: (v: string) => void;
	onCreateParty: () => void;
	onJoinParty: (code: string) => void;
}) {
	return (
		<frame
			Size={new UDim2(0, 480, 0, 300)}
			Position={new UDim2(0.5, -240, 0.5, -100)}
			BackgroundColor3={Color3.fromRGB(20, 24, 40)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 10)} />

			<textbutton
				Size={new UDim2(1, -40, 0, 60)}
				Position={new UDim2(0, 20, 0, 30)}
				BackgroundColor3={Color3.fromRGB(60, 110, 220)}
				BorderSizePixel={0}
				Text="Create Party"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				Event={{ Activated: () => props.onCreateParty() }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>

			<textlabel
				Size={new UDim2(1, -40, 0, 20)}
				Position={new UDim2(0, 20, 0, 110)}
				BackgroundTransparency={1}
				Text="OR JOIN WITH A CODE"
				TextColor3={Color3.fromRGB(140, 150, 180)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>

			<textbox
				Size={new UDim2(1, -40, 0, 50)}
				Position={new UDim2(0, 20, 0, 140)}
				BackgroundColor3={Color3.fromRGB(12, 16, 28)}
				BorderSizePixel={0}
				Text={props.joinCode}
				PlaceholderText="ABC123"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				PlaceholderColor3={Color3.fromRGB(90, 100, 130)}
				TextScaled
				Font={Enum.Font.GothamBold}
				ClearTextOnFocus={false}
				Event={{
					FocusLost: (rbx) => props.setJoinCode(rbx.Text),
				}}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbox>

			<textbutton
				Size={new UDim2(1, -40, 0, 50)}
				Position={new UDim2(0, 20, 0, 210)}
				BackgroundColor3={Color3.fromRGB(50, 54, 70)}
				BorderSizePixel={0}
				Text="Join"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				Event={{ Activated: () => props.onJoinParty(props.joinCode) }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>
		</frame>
	);
}

function PartyPanel(props: { party: PartyState; onLeaveParty: () => void; onToggleReady: () => void }) {
	const localId = Players.LocalPlayer.UserId;
	const myself = props.party.members.find((m) => m.userId === localId);
	const amReady = myself?.ready === true;

	return (
		<frame
			Size={new UDim2(0, 520, 0, 400)}
			Position={new UDim2(0.5, -260, 0.5, -160)}
			BackgroundColor3={Color3.fromRGB(20, 24, 40)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 10)} />

			<textlabel
				Size={new UDim2(1, -40, 0, 30)}
				Position={new UDim2(0, 20, 0, 20)}
				BackgroundTransparency={1}
				Text={`CODE ${props.party.code}`}
				TextColor3={Color3.fromRGB(120, 200, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, -40, 0, 20)}
				Position={new UDim2(0, 20, 0, 55)}
				BackgroundTransparency={1}
				Text="Share this code with your squad"
				TextColor3={Color3.fromRGB(140, 150, 180)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>

			{props.party.members.map((member, i) => (
				<frame
					key={tostring(member.userId)}
					Size={new UDim2(1, -40, 0, 40)}
					Position={new UDim2(0, 20, 0, 100 + i * 50)}
					BackgroundColor3={Color3.fromRGB(12, 16, 28)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, 6)} />
					<textlabel
						Size={new UDim2(0.7, 0, 1, 0)}
						Position={new UDim2(0, 12, 0, 0)}
						BackgroundTransparency={1}
						Text={member.displayName}
						TextColor3={Color3.fromRGB(235, 240, 255)}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextScaled
						Font={Enum.Font.Gotham}
					/>
					<textlabel
						Size={new UDim2(0.3, -12, 1, 0)}
						Position={new UDim2(0.7, 0, 0, 0)}
						BackgroundTransparency={1}
						Text={member.ready ? "READY" : "—"}
						TextColor3={member.ready ? Color3.fromRGB(120, 220, 140) : Color3.fromRGB(100, 110, 140)}
						TextScaled
						Font={Enum.Font.GothamBold}
					/>
				</frame>
			))}

			{(() => {
				const empties: Roact.Element[] = [];
				for (let i = props.party.members.size(); i < PARTY_MAX_SIZE; i++) {
					empties.push(
						<frame
							key={`empty-${i}`}
							Size={new UDim2(1, -40, 0, 40)}
							Position={new UDim2(0, 20, 0, 100 + i * 50)}
							BackgroundColor3={Color3.fromRGB(14, 18, 32)}
							BorderSizePixel={0}
						>
							<uicorner CornerRadius={new UDim(0, 6)} />
							<textlabel
								Size={new UDim2(1, -24, 1, 0)}
								Position={new UDim2(0, 12, 0, 0)}
								BackgroundTransparency={1}
								Text="(empty slot)"
								TextColor3={Color3.fromRGB(80, 90, 120)}
								TextXAlignment={Enum.TextXAlignment.Left}
								TextScaled
								Font={Enum.Font.Gotham}
							/>
						</frame>,
					);
				}
				return empties;
			})()}

			<textbutton
				Size={new UDim2(0.5, -26, 0, 48)}
				Position={new UDim2(0, 20, 1, -62)}
				BackgroundColor3={Color3.fromRGB(80, 40, 40)}
				BorderSizePixel={0}
				Text="Leave"
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				Event={{ Activated: () => props.onLeaveParty() }}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
			</textbutton>

			<textbutton
				Size={new UDim2(0.5, -26, 0, 48)}
				Position={new UDim2(0.5, 6, 1, -62)}
				BackgroundColor3={amReady ? Color3.fromRGB(50, 54, 70) : Color3.fromRGB(60, 140, 90)}
				BorderSizePixel={0}
				Text={amReady ? "Unready" : "Ready"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				Event={{ Activated: () => props.onToggleReady() }}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
			</textbutton>
		</frame>
	);
}

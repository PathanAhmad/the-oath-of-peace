import Roact, { useEffect, useState } from "@rbxts/react";
import { Players } from "@rbxts/services";
import { CLASS_DISPLAY_NAME, CLASS_IDS, CLASS_TAGLINE, ClassId } from "shared/types/Class";
import { PartyState, PreMatchReward } from "shared/types/Party";

interface Props {
	party: PartyState;
	rewards: PreMatchReward[];
	onPickClass: (classId: ClassId) => void;
	onRequestClass: (classId: ClassId) => void;
}

export function PreMatchLoadoutApp({ party, rewards, onPickClass, onRequestClass }: Props) {
	const localId = Players.LocalPlayer.UserId;
	const me = party.members.find((m) => m.userId === localId);

	const [remaining, setRemaining] = useState(math.max(0, party.countdownEndsAt - os.time()));

	useEffect(() => {
		const conn = game.GetService("RunService").Heartbeat.Connect(() => {
			setRemaining(math.max(0, party.countdownEndsAt - os.time()));
		});
		return () => conn.Disconnect();
	}, [party.countdownEndsAt]);

	const rewardByClass = new Map<ClassId, PreMatchReward>();
	for (const r of rewards) rewardByClass.set(r.classId, r);

	return (
		<frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundColor3={Color3.fromRGB(12, 14, 24)}
			BorderSizePixel={0}
		>
			<textlabel
				Size={new UDim2(1, 0, 0, 60)}
				Position={new UDim2(0, 0, 0, 30)}
				BackgroundTransparency={1}
				Text="PRE-MATCH LOADOUT"
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 40)}
				Position={new UDim2(0, 0, 0, 90)}
				BackgroundTransparency={1}
				Text={`Deploying in ${remaining}s`}
				TextColor3={Color3.fromRGB(120, 200, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>

			<frame
				Size={new UDim2(0, 900, 0, 260)}
				Position={new UDim2(0.5, -450, 0, 150)}
				BackgroundTransparency={1}
			>
				{CLASS_IDS.map((classId, i) => {
					const reward = rewardByClass.get(classId);
					const isPicked = me?.pickedClass === classId;
					const pickedByOthers = party.members.filter(
						(m) => m.pickedClass === classId && m.userId !== localId,
					);
					return (
						<ClassCard
							key={classId}
							classId={classId}
							index={i}
							isPicked={isPicked}
							pickedByCount={pickedByOthers.size()}
							reward={reward}
							onPick={() => onPickClass(classId)}
							onRequest={() => onRequestClass(classId)}
						/>
					);
				})}
			</frame>

			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				Position={new UDim2(0, 0, 1, -40)}
				BackgroundTransparency={1}
				Text={
					me?.pickedClass !== undefined
						? `Your pick: ${CLASS_DISPLAY_NAME[me.pickedClass]}`
						: "No pick yet — defaults to last played (Assault)"
				}
				TextColor3={Color3.fromRGB(180, 190, 220)}
				TextScaled
				Font={Enum.Font.Gotham}
			/>
		</frame>
	);
}

function ClassCard(props: {
	classId: ClassId;
	index: number;
	isPicked: boolean;
	pickedByCount: number;
	reward: PreMatchReward | undefined;
	onPick: () => void;
	onRequest: () => void;
}) {
	const { classId, index, isPicked, pickedByCount, reward } = props;
	const baseColor = isPicked ? Color3.fromRGB(40, 90, 180) : Color3.fromRGB(20, 24, 40);
	const rewardLabel =
		reward !== undefined
			? reward.reason === "requested"
				? `+${reward.xpBonusPct}% XP (Requested)`
				: `+${reward.xpBonusPct}% XP (Needed)`
			: undefined;

	return (
		<frame
			Size={new UDim2(0, 170, 1, 0)}
			Position={new UDim2(0, index * 180, 0, 0)}
			BackgroundColor3={baseColor}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />

			<textlabel
				Size={new UDim2(1, -16, 0, 32)}
				Position={new UDim2(0, 8, 0, 10)}
				BackgroundTransparency={1}
				Text={CLASS_DISPLAY_NAME[classId]}
				TextColor3={Color3.fromRGB(235, 240, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
			/>

			<textlabel
				Size={new UDim2(1, -16, 0, 60)}
				Position={new UDim2(0, 8, 0, 46)}
				BackgroundTransparency={1}
				Text={CLASS_TAGLINE[classId]}
				TextColor3={Color3.fromRGB(170, 180, 210)}
				TextWrapped
				TextSize={14}
				Font={Enum.Font.Gotham}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>

			{pickedByCount > 0 && (
				<textlabel
					Size={new UDim2(1, -16, 0, 16)}
					Position={new UDim2(0, 8, 0, 110)}
					BackgroundTransparency={1}
					Text={`×${pickedByCount} teammate${pickedByCount > 1 ? "s" : ""}`}
					TextColor3={Color3.fromRGB(150, 160, 190)}
					TextSize={13}
					Font={Enum.Font.Gotham}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			)}

			{rewardLabel !== undefined && (
				<textlabel
					Size={new UDim2(1, -16, 0, 18)}
					Position={new UDim2(0, 8, 0, 130)}
					BackgroundTransparency={1}
					Text={rewardLabel}
					TextColor3={
						reward?.reason === "requested"
							? Color3.fromRGB(240, 200, 80)
							: Color3.fromRGB(120, 220, 140)
					}
					TextSize={13}
					Font={Enum.Font.GothamBold}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
			)}

			<textbutton
				Size={new UDim2(1, -16, 0, 36)}
				Position={new UDim2(0, 8, 1, -84)}
				BackgroundColor3={isPicked ? Color3.fromRGB(50, 54, 70) : Color3.fromRGB(60, 110, 220)}
				BorderSizePixel={0}
				Text={isPicked ? "Picked" : "Pick"}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextScaled
				Font={Enum.Font.GothamBold}
				AutoButtonColor={!isPicked}
				Event={{ Activated: () => props.onPick() }}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
			</textbutton>

			<textbutton
				Size={new UDim2(1, -16, 0, 36)}
				Position={new UDim2(0, 8, 1, -44)}
				BackgroundColor3={Color3.fromRGB(30, 40, 60)}
				BorderSizePixel={0}
				Text={`Request ${CLASS_DISPLAY_NAME[classId]}`}
				TextColor3={Color3.fromRGB(220, 225, 240)}
				TextScaled
				Font={Enum.Font.Gotham}
				Event={{ Activated: () => props.onRequest() }}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
			</textbutton>
		</frame>
	);
}

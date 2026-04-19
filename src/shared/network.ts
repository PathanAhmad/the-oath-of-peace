import { Networking } from "@flamework/networking";
import { ClassId } from "./types/Class";
import { PartyState, PreMatchReward } from "./types/Party";

interface ClientToServerEvents {
	// character creator (Slice 1)
	confirmCharacterCreated(): void;

	// party lifecycle (Slice 2)
	createParty(): void;
	joinParty(code: string): void;
	leaveParty(): void;
	toggleReady(): void;
	pickClass(classId: ClassId): void;
	requestClass(classId: ClassId): void;

	// match lifecycle (Slice 2)
	endMatch(): void;
}

interface ServerToClientEvents {
	// character creator
	profileLoaded(profile: { hasCompletedCreator: boolean }): void;
	profileUpdated(profile: { hasCompletedCreator: boolean }): void;

	// party lifecycle
	partyUpdated(party: PartyState | undefined): void;
	partyError(message: string): void;

	// pre-match
	preMatchRewards(rewards: PreMatchReward[]): void;

	// match
	matchJoined(info: { classId: ClassId }): void;
}

interface ClientToServerFunctions {}
interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();

import { Networking } from "@flamework/networking";

interface ClientToServerEvents {
	confirmCharacterCreated(): void;
}

interface ServerToClientEvents {
	profileLoaded(profile: { hasCompletedCreator: boolean }): void;
	profileUpdated(profile: { hasCompletedCreator: boolean }): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();

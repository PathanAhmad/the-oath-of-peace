import { ClassId } from "./Class";

export const PARTY_MAX_SIZE = 4;
export const PARTY_CODE_LENGTH = 6;

export interface PartyMember {
	userId: number;
	displayName: string;
	ready: boolean;
	pickedClass?: ClassId;
}

export interface PartyState {
	code: string;
	leaderUserId: number;
	members: PartyMember[];
	/**
	 * Classes other members have requested filled. Adds the +15% XP flag on
	 * the pre-match screen for anyone who still hasn't picked.
	 */
	requestedClasses: ClassId[];
	/** "forming" in lobby, "preMatch" during countdown, "launching" once reserved server issued. */
	phase: "forming" | "preMatch" | "launching";
	/** Unix epoch seconds when the pre-match countdown auto-deploys. 0 if not in preMatch. */
	countdownEndsAt: number;
}

export interface PreMatchReward {
	classId: ClassId;
	xpBonusPct: number;
	reason: "auto-needed" | "requested";
}

import { Appearance, DEFAULT_APPEARANCE } from "./Appearance";

/**
 * @deprecated Use ProfileData (v2+). Kept so migrations can refer to the old shape.
 */
export interface ProfileDataV1 {
	schemaVersion: 1;
	createdAt: number;
	lastLogin: number;
	sessionsStarted: number;
	hasCompletedCreator: boolean;
}

export interface ProfileDataV2 {
	schemaVersion: 2;
	createdAt: number;
	lastLogin: number;
	sessionsStarted: number;
	hasCompletedCreator: boolean;
	appearance: Appearance;
}

export type ProfileData = ProfileDataV2;

export const PROFILE_TEMPLATE: ProfileData = {
	schemaVersion: 2,
	createdAt: 0,
	lastLogin: 0,
	sessionsStarted: 0,
	hasCompletedCreator: false,
	appearance: DEFAULT_APPEARANCE,
};

/**
 * Legacy export kept for code still importing the old name. Safe to remove
 * once all call sites use PROFILE_TEMPLATE / ProfileData.
 */
export const PROFILE_TEMPLATE_V1: ProfileData = PROFILE_TEMPLATE;

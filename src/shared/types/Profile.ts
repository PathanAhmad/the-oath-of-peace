export interface ProfileDataV1 {
	schemaVersion: 1;
	createdAt: number;
	lastLogin: number;
	sessionsStarted: number;
	hasCompletedCreator: boolean;
}

export const PROFILE_TEMPLATE_V1: ProfileDataV1 = {
	schemaVersion: 1,
	createdAt: 0,
	lastLogin: 0,
	sessionsStarted: 0,
	hasCompletedCreator: false,
};

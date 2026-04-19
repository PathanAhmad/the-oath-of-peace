export const RATE_LIMITS = {
	confirmCharacterCreated: { refillPerSec: 0.5, burst: 2 },
	createParty: { refillPerSec: 0.5, burst: 2 },
	joinParty: { refillPerSec: 1, burst: 3 },
	leaveParty: { refillPerSec: 1, burst: 3 },
	toggleReady: { refillPerSec: 2, burst: 5 },
	pickClass: { refillPerSec: 2, burst: 5 },
	requestClass: { refillPerSec: 1, burst: 3 },
	endMatch: { refillPerSec: 0.25, burst: 1 },
} as const;

export type RateLimitedRemote = keyof typeof RATE_LIMITS;

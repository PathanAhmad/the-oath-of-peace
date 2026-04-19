export const RATE_LIMITS = {
	confirmCharacterCreated: { refillPerSec: 0.5, burst: 2 },
} as const;

export type RateLimitedRemote = keyof typeof RATE_LIMITS;

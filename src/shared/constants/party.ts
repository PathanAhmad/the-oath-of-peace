export const PRE_MATCH_COUNTDOWN_SECONDS = 20;
export const NEEDED_CLASS_XP_BONUS_PCT = 10;
export const REQUESTED_CLASS_XP_BONUS_PCT = 15;

/**
 * Memory store namespace used for party state + match handoff.
 * Shard by taking the first hex char of the party code, so
 * no single partition gets all the writes.
 */
export const MEMORY_STORE_NAMESPACE = "oath";

export const MEMORY_KEYS = {
	party: (code: string) => `${MEMORY_STORE_NAMESPACE}:party:${code}`,
	match: (accessCode: string) => `${MEMORY_STORE_NAMESPACE}:match:${accessCode}`,
} as const;

export const MEMORY_TTL_SECONDS = {
	party: 30 * 60, // 30 min — parties auto-expire
	match: 5 * 60, // 5 min — match handoff, short
} as const;

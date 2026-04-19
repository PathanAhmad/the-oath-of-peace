import { Service } from "@flamework/core";
import { RATE_LIMITS, RateLimitedRemote } from "shared/constants/network";

interface Bucket {
	tokens: number;
	lastRefill: number;
}

@Service()
export class RateLimiter {
	private buckets = new Map<number, Map<RateLimitedRemote, Bucket>>();

	allow(userId: number, remote: RateLimitedRemote): boolean {
		const config = RATE_LIMITS[remote];
		const now = os.clock();
		let perRemote = this.buckets.get(userId);
		if (!perRemote) {
			perRemote = new Map();
			this.buckets.set(userId, perRemote);
		}
		let bucket = perRemote.get(remote);
		if (!bucket) {
			bucket = { tokens: config.burst, lastRefill: now };
			perRemote.set(remote, bucket);
		}

		const elapsed = now - bucket.lastRefill;
		bucket.tokens = math.min(config.burst, bucket.tokens + elapsed * config.refillPerSec);
		bucket.lastRefill = now;

		if (bucket.tokens < 1) return false;
		bucket.tokens -= 1;
		return true;
	}

	clearPlayer(userId: number) {
		this.buckets.delete(userId);
	}
}

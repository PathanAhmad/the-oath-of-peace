import { describe, expect, it } from "@rbxts/jest-globals";
import { RateLimiter } from "server/services/RateLimiter";

describe("RateLimiter", () => {
	it("allows up to burst then drops", () => {
		const limiter = new RateLimiter();
		const uid = 12345;
		let allowed = 0;
		for (let i = 0; i < 5; i++) {
			if (limiter.allow(uid, "confirmCharacterCreated")) allowed++;
		}
		// confirmCharacterCreated burst=2, refill=0.5/s. Fast loop → only 2 allowed.
		expect(allowed).toBe(2);
	});

	it("refills over time", () => {
		const limiter = new RateLimiter();
		const uid = 99999;
		// Exhaust burst
		limiter.allow(uid, "toggleReady");
		limiter.allow(uid, "toggleReady");
		limiter.allow(uid, "toggleReady");
		limiter.allow(uid, "toggleReady");
		limiter.allow(uid, "toggleReady"); // should hit 0 tokens

		// Wait ~1.5s — at refill 2/s that's 3 tokens back, capped at burst=5.
		task.wait(1.5);
		let allowedAfterRefill = 0;
		for (let i = 0; i < 5; i++) {
			if (limiter.allow(uid, "toggleReady")) allowedAfterRefill++;
		}
		expect(allowedAfterRefill).toBeGreaterThan(0);
		expect(allowedAfterRefill).toBeLessThanOrEqual(5);
	});

	it("isolates players", () => {
		const limiter = new RateLimiter();
		// Player A exhausts
		limiter.allow(1, "confirmCharacterCreated");
		limiter.allow(1, "confirmCharacterCreated");
		expect(limiter.allow(1, "confirmCharacterCreated")).toBe(false);
		// Player B fresh — should still allow
		expect(limiter.allow(2, "confirmCharacterCreated")).toBe(true);
	});

	it("isolates remotes per player", () => {
		const limiter = new RateLimiter();
		limiter.allow(1, "createParty");
		limiter.allow(1, "createParty");
		expect(limiter.allow(1, "createParty")).toBe(false);
		// Different remote, same player — fresh bucket
		expect(limiter.allow(1, "joinParty")).toBe(true);
	});
});

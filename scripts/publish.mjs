#!/usr/bin/env node
/**
 * Publish the built `oath.rbxlx` to the Hub and Match places on Roblox via
 * the Open Cloud Place Publishing API.
 *
 * Required env vars (put them in `.env` — gitignored):
 *   ROBLOX_OPEN_CLOUD_KEY  — Open Cloud API key with "Place Management" scope
 *                            for both the Hub and Match places, `write` permission.
 *   ROBLOX_UNIVERSE_ID     — the Universe ID containing both places (NOT the placeId).
 *                            Find it at https://create.roblox.com/dashboard/creations →
 *                            click the experience → URL contains `/creations/experience/<UNIVERSE_ID>`.
 *
 * Usage:
 *   pnpm build && rojo build -o oath.rbxlx
 *   pnpm publish:dev                    # publishes to both places (Hub + Match)
 *   pnpm publish:dev hub                # just Hub
 *   pnpm publish:dev match              # just Match
 *
 * Exit codes:
 *   0  all requested places published
 *   1  config error (missing env, missing build output)
 *   2  one or more publish calls failed
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PLACES = {
	hub: 93283527222699,
	match: 84618714551346,
};

async function loadEnv() {
	const envPath = join(process.cwd(), ".env");
	if (!existsSync(envPath)) return;
	const raw = await readFile(envPath, "utf8");
	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
		if (!(key in process.env)) process.env[key] = value;
	}
}

async function publishPlace(universeId, placeId, rbxlxBuffer, apiKey) {
	const url = `https://apis.roblox.com/universes/v1/${universeId}/places/${placeId}/versions?versionType=Published`;
	const start = Date.now();
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"x-api-key": apiKey,
			"Content-Type": "application/octet-stream",
		},
		body: rbxlxBuffer,
	});
	const elapsedMs = Date.now() - start;
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP ${response.status} ${response.statusText} — ${text}`);
	}
	const json = await response.json();
	return { versionNumber: json.versionNumber, elapsedMs };
}

async function main() {
	await loadEnv();

	const apiKey = process.env.ROBLOX_OPEN_CLOUD_KEY;
	const universeId = process.env.ROBLOX_UNIVERSE_ID;

	if (!apiKey) {
		console.error("ERROR: ROBLOX_OPEN_CLOUD_KEY not set. See scripts/publish.mjs header.");
		process.exit(1);
	}
	if (!universeId) {
		console.error("ERROR: ROBLOX_UNIVERSE_ID not set. See scripts/publish.mjs header.");
		process.exit(1);
	}

	const rbxlxPath = join(process.cwd(), "oath.rbxlx");
	if (!existsSync(rbxlxPath)) {
		console.error(`ERROR: ${rbxlxPath} not found. Run \`pnpm build && rojo build -o oath.rbxlx\` first.`);
		process.exit(1);
	}
	const rbxlxBuffer = await readFile(rbxlxPath);
	console.log(`Read ${rbxlxPath} (${(rbxlxBuffer.length / 1024).toFixed(1)} KB)`);

	const arg = process.argv[2];
	const targets = arg === "hub" ? ["hub"] : arg === "match" ? ["match"] : ["hub", "match"];

	let failed = 0;
	for (const key of targets) {
		const placeId = PLACES[key];
		process.stdout.write(`Publishing ${key} (${placeId}) … `);
		try {
			const { versionNumber, elapsedMs } = await publishPlace(universeId, placeId, rbxlxBuffer, apiKey);
			console.log(`ok — version ${versionNumber} in ${elapsedMs} ms`);
		} catch (err) {
			console.log(`FAILED`);
			console.error(`  ${err.message}`);
			failed++;
		}
	}

	process.exit(failed > 0 ? 2 : 0);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});

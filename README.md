# The Oath

Roblox 4-player co-op shooter. Galactic Guardians liberate alien planets overrun by parasites. Server-wide campaign decides whether the squad ever faces the Hive Queen.

---

## One-line pitch

*4 Guardians drop onto an overrun alien planet. Push hives, defend cities, escort civilians. Every server contributes to the same war — the Hive Queen only spawns at campaign's end if humanity has been winning.*

## Core fantasy

You and 3 friends are **Galactic Guardians** — interstellar protectors sworn to liberate worlds. Drop into a planet held by a parasitic army, fight up a real military hierarchy of enemies, and chip away at the war one sector at a time. Your wins (and losses) push the global campaign toward the final confrontation with the Hive Queen.

## Why this exists

Nobody has done a Helldivers 2 / Starship Troopers-style co-op shooter on Roblox with **a real meta-campaign and an army-tier enemy hierarchy**. Dead Rails proved the audience exists. The space is wide open.

## Scope — what's in (launch — "Campaign 1")

- 4-player co-op missions (squad of 4 Galactic Guardians)
- 5 classes: Assault, Medic, Engineer, Recon, Vanguard
- 3 mission types: Purge Hive, Hold the Plaza, Evacuation Run
- 8 enemy types + 2 mid-bosses (Champions) + 4–6 Sector Commanders + 1 Hive Queen finale
- 6-tier parasite army hierarchy — Drones → Specialists → Heavies → Champions → Sector Commanders → Queen
- 5 difficulty tiers: Sweep / Operation / Crisis / Outbreak / Total Loss
- Orbital Uplink call-in system (ammo, med, sentry, airstrike, backup) — design deferred post-MVP, economy TBD (see OPEN.md)
- Shared planet campaign — sectors won/lost across all servers, Queen unlock gated by global progress
- Per-class XP (earned from play, unlocks weapons post-alpha) + cosmetic system (Honor-purchased, purely visual)
- Procedurally generated maps (layered templates with randomized slots)

## Scope — what's out (for now)

- PvP
- Open-world roaming
- More than 4 players per lobby
- Player-to-player trading
- Vehicles (Phase 5+)

## Monetization

- **XP** (per-class, earned from play) unlocks weapons and cosmetic slots — never purchasable.
- **Honor** (Robux-purchased) buys cosmetic skins only — never gameplay power.
- All weapons within a class are sidegrades (different feel, never strictly better) — preserves "no pay-to-win."
- Campaign-exclusive cosmetics + badges + titles are earn-only, never purchasable.
- Gifting (items, not currency) deferred post-MVP.

## Current status

- Concept locked. Design committed. MVP scope locked — see DESIGN.md.
- Phase 0 step 1: scaffold DONE (Flamework + Rokit + pnpm + lint/format/build gates verified).
- Phase 0 step 2: validation sprint (Tripo → Studio pipeline test) — pending.
- No assets produced yet.

---

## Where to find things

- [CLAUDE.md](CLAUDE.md) — agent contract + hard rules (Claude reads this first)
- [DESIGN.md](DESIGN.md) — gameplay mechanics committed
- [OPEN.md](OPEN.md) — decisions still open
- [STACK.md](STACK.md) — tech stack decisions with rationale
- [VALIDATION.md](VALIDATION.md) — 1-week de-risk sprint plan + research findings
- [PIPELINE.md](PIPELINE.md) — how assets flow from Tripo to Roblox
- [WORKFLOW.md](WORKFLOW.md) — how Ahmad and Claude collaborate day-to-day
- [TOOLS.md](TOOLS.md) — free and paid MCPs + tools that give Claude direct control
- [SETUP.md](SETUP.md) — step-by-step install + config for every tool
- [STARTUP.md](STARTUP.md) — what the new chat does first

---

## Start here (for new chat)

**Claude:** read CLAUDE.md first, then STARTUP.md. Everything else flows from those.

**Ahmad:** open a new Claude chat in this folder. Say "read CLAUDE.md and STARTUP.md, then we continue Phase 0."

Phase 0 goals:
1. ✅ Lock setting + faction + classes + mission types + army hierarchy
2. ✅ Scaffold the code project (roblox-ts + Flamework + Rokit + pnpm; all gates green)
3. Run validation sprint item 1 (Tripo → Studio pipeline test)

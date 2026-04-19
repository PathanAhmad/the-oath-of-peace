# Open questions

Decisions not yet made. Roughly ordered by blocking priority.

---

## Resolved (logged in DESIGN.md)

### Identity
- ✅ **Game name:** *The Oath*
- ✅ **Setting:** Parasites overrunning a civilized alien planet
- ✅ **Tone:** Stylized sci-fi (bright alien cities + dark organic hives)
- ✅ **Faction:** Galactic Guardians (interstellar protectors — knightly, not cop)
- ✅ **Faction crest:** Shield with four-rayed white star on deep blue field
- ✅ **Currency (two-currency model):** XP earned per-class from missions (unlocks weapons + cosmetic slots). Honor purchased with Robux only (cosmetics only). No pay-to-win surface. No gifting in MVP.

### Combat + classes
- ✅ **Squad roles:** 5 fixed classes (Assault, Medic, Engineer, Recon, Vanguard) — duplicates allowed
- ✅ **Friendly fire:** OFF
- ✅ **Revive system:** Medic 4s, anyone else 12s; Medic can be revived too
- ✅ **Respawn:** 60s respawn at HQ structure / mission spawn point after full bleed-out
- ✅ **XP:** Per-class (each class levels independently)

### Enemies
- ✅ **6-tier Parasite Army hierarchy** — Drones → Specialists → Heavies → Champions → Sector Commanders → Queen
- ✅ **Launch enemy roster:** Larva, Thrall, Spewer, Cling, Burster, Maul, Spawner, Stalker (8 enemies, phased rollout)
- ✅ **Champions:** Brood Warden, Hive Lord
- ✅ **Hive Queen:** The Maw — gated behind global server campaign progress (Campaign 1 finale only)
- ✅ **Difficulty × tier mapping:** Sweep / Operation / Crisis / Outbreak / Total Loss

### Missions
- ✅ **Mission types (3):** Purge Hive, Hold the Plaza, Evacuation Run
- ✅ **Civilian death penalty (Evacuation Run):** soft Honor reduction + sector contribution loss; all dead = mission fails

### Systems
- ✅ **Engineer's tool:** Build only (turrets + walls)
- ✅ **Procedural generation:** Layered templates with randomized slots + seed-locked
- ✅ **Cosmetic monetization:** Single global system — variants for every weapon, mechanically identical
- ✅ **Weapon monetization:** Weapons unlock via XP (per-class). Sidegrades only, never strict upgrades. Honor does NOT buy weapons.
- ✅ **Lobby shop (Phase 3+):** Honor-spent cosmetics only, in hub lobby UI

### Player flow
- ✅ **Character creator:** Looks only (name + face + skin). First-time mandatory, revisitable free from hub.
- ✅ **Class selection:** Pre-match loadout screen (between hub Ready and match teleport). Not in character creator, not in match.
- ✅ **"Needed class" rewards:** Auto-detected missing classes +10% XP. Player-requested classes +15% XP. First-pick-wins. Max +15%.
- ✅ **Pre-match countdown:** Auto-deploy at 0. No-pick defaults to last-played class.
- ✅ **Lobby architecture:** Two places — public hub + reserved-server match (via `ReserveServerAsync` + `TeleportAsync`). MemoryStore for party/match state only.
- ✅ **MVP matchmaking scope:** Party codes only. Random-fill matchmaking deferred Phase 3.

### Vehicles
- ✅ **Deferred to Phase 5+** — vehicles are a post-launch content drop

---

## Important — decide during Phase 1

### 1. Weapon roster at launch
Alpha launches with 1 weapon per class. Post-alpha: how many unlockable weapons per class? Pacing of unlocks?

### 2. Base-building kit scope
Exact list of buildable pieces (Engineer's Build mode). Currently planned: 1 auto-turret type, walls. Expand to sandbags / barricades / ammo cache structures?

### 3. Campaign 1 story arc
What's the first campaign's narrative? Who is the alien civilian race we're protecting? How does the war advance week-to-week? What's the Queen Gate threshold (% sectors liberated globally)?

### 4. Sector Commander roster
4–6 unique commanders for Campaign 1. Names + designs (working names: Voidcaller, Bloodmother, Conclave, Devourer, Stillborn, Architect).

### 5. Vanguard gauntlet variants
Default = basic metal gauntlets. What unlock variants ship at launch? (spiked, energized, bone-crusher — all visual only)

### 6. Recon sword variants
Default = standard combat sword. What unlock variants ship at launch?

### 7. Honor → Robux pricing
How many Robux = how much Honor? Affects shop design. Decide when Phase 3 shop ships.

---

## Defer — decide later

### 8. Beyond-launch mission types
Sabotage, intel recovery, boss hunt — which come in post-launch updates?

### 9. Clan / guild features
Should squads be able to form persistent clans? Clan-vs-clan war contributions?

### 10. Seasonal content cadence
How often does a new campaign launch? What's in each?

### 11. Voice chat
Spatial only? Always-on team comms? Opt-in? See VALIDATION.md item 4.

### 15. Orbital Uplink economy (post-MVP, Phase 3+)
Old design had Uplink call-ins powered by Honor. Honor is now paid-only, so that's pay-to-win. Uplinks need a new in-match resource — working idea: "Supply" earned from kills/objectives, resets each mission, not persistent, not purchasable, not giftable. Decide: does Supply carry between lives in a mission? How fast does it accumulate? Per-player or shared-squad pool? Costs for each call-in?

### 16. Gifting system (post-launch)
Design locked: gift **items** not currency. 7-day account-age gate on gifter + recipient. Rate limits (10 sent / 24h, 20 received / 24h). Audit log of `{itemId, fromUserId, toUserId, purchaseId, timestamp}` for manual reversal on refund. Not friends-only. Decide at ship time: UI surface, which items are giftable (cosmetics only? limited-time only?), any queue/pending states.

### 17. Matchmaking (Phase 3+)
MVP is private party codes. Phase 3 adds quick-match (random squad fill). Design open: Elo-style MMR scalar, sharded `MemoryStoreSortedMap` queues (shard by `hash(userId) % 8`), coordinator leader-election via `MemoryStoreHashMap` lock. Decide: MMR bucket width, widen-over-time rule, cross-mission matchmaking, solo-vs-premade balancing.

---

## Phase-locked (decide when phase arrives)

- Map size + mission length specifics (Phase 3)
- HUD design (Phase 3)
- Hive Queen boss mechanics (Campaign 1 finale)
- Civilian AI behavior (Phase 4)
- Tutorial / first-time experience (Phase 5)
- Lobby + matchmaking UI (Phase 4)
- Tuning numbers (HP, damage, ammo, XP curves, ore drop rates) — Phase 3 playtests

---

## Technical — decide during Phase 2

### 12. Max planet sectors at launch
How many zones on the war map? Starts small, grows with campaigns?

### 13. MemoryStore vs DataStore boundaries
What's real-time shared state vs persistent state? Queen Gate progress is shared real-time; campaign history is persistent.

### 14. Anti-cheat approach
Server-authoritative combat is the baseline. Specifics beyond that?

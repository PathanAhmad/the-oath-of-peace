# Design — gameplay mechanics

What we've agreed on so far. Anything not listed here hasn't been decided.

---

## MVP scope (skeleton-first)

Before any gameplay exists, we build the **full player loop end-to-end with placeholders** — so every screen transitions, every remote fires, every profile write persists. Then we go back and fill the hollow segments with real content.

**MVP success criteria:** 4 players go through character creator → hub lobby → party up via code → pre-match loadout (pick class + request buttons) → reserved match server → "You are {class}" screen → End Match → back to hub → per-class XP persisted.

### MVP IN

| System | MVP version |
|---|---|
| Scaffold + CI + ByteNet middleware + ProfileStore | Production-quality |
| Character creator | Name + face enum + skin enum. Ugly UI OK. Revisitable from hub. Looks only. |
| Hub lobby (place 1) | Placeholder, 4-player party via 6-char code, Ready button |
| Pre-match loadout | Class pick, "Request {class}" buttons, +10%/+15% XP reward indicators, countdown auto-deploy, last-played default on no-pick |
| Match (place 2) | Reserved server via `ReserveServerAsync` + `TeleportAsync`. Baseplate + "You are {class}" TextLabel + End Match button. Default R15 rig. |
| Post-match | XP applied per-class, teleport back to hub |
| Currency | Honor (purchased only) + XP (earned, per-class) |

### MVP OUT (deferred)

| System | Deferred to |
|---|---|
| Guns, combat, shooting | Phase 2 |
| Enemies, AI, pathfinding | Phase 2 |
| Custom class rigs | Phase 2 |
| Revive / respawn / Medic mechanics | Phase 2 |
| Real mission types + biomes | Phase 3 |
| Cosmetic items + shop + equip UI | Phase 3 |
| Orbital Uplink call-ins | Phase 3+ |
| Gifting (cosmetic items only when shipped) | Post-launch |
| Matchmaking (random squad fill) | Phase 3 — MVP is party-codes only |
| Planet campaign / sectors / shared war progress | Phase 4 |

---

## Setting + faction

**Setting (locked):** A civilized alien planet has been overrun by parasitic invaders. The native aliens are a peaceful spacefaring civilization; the parasites infest hosts, build hives, and threaten to spread off-world.

**Faction (locked):** Players are **Galactic Guardians** — interstellar protectors sworn to liberate worlds. Knightly/protector aesthetic — clean lines, faction crest, helmet that signals "I am here to help, not arrest." Less authoritarian, more idealistic. Liberators, not enforcers.

**Faction crest:** Shield bearing a four-rayed star. White star on deep blue field. The 4 rays = 4-player squad. Recognizable on shoulder pauldrons + UI corners.

**Game name:** *The Oath of Peace* — Guardians take an oath to defend the peaceful against those who would end it.

**Tone (locked):** Stylized sci-fi. Bright alien cities + dark organic hives. Not gritty realism, not arcade cartoon — somewhere in between.

**Why this setting:** Wilderness/hive biomes are cheap to produce; alien architecture is forgiving (no urban realism); civilian aliens give us escort + protect missions for free; parasite enemies justify body horror, swarms, and infested-host variants without uncanny valley.

---

## Squad

- **4 players per mission.**
- Co-op only (no PvP within squad).
- Voice chat enabled, proximity-aware.
- Friends fill naturally; matchmaking fills the rest (Phase 3+ — MVP is party-codes only).
- Class duplicates allowed (squad of 4 can have 2 Assaults).

---

## Player flow (hub → pre-match → match → hub)

### Character creator (looks only)

First-time join → mandatory character creator (name + face + skin). Saved to profile. Revisitable from hub lobby at any time, free. **Does not set class** — class is per-match, picked on the pre-match loadout screen.

### Hub lobby (persistent social place)

- Public place, players drop in.
- Player sees their character. Can revisit character creator.
- Can create a party (6-char code) or join via code.
- Party of 1–4 hits Ready → transitions everyone to pre-match loadout screen.
- Phase 3+: matchmaking queue (quick-match for random squads), Honor shop, cosmetic equip.

### Pre-match loadout screen (between hub Ready and match teleport)

This is the **class-pick moment**, not the hub and not the match.

- Each player sees the 5 class buttons and a mission preview.
- **Auto-detect "needed" classes** (up to 2 most-impactful missing classes) — shown with **+10% XP** indicator for picking them. Duplicates allowed, so "needed" means "zero of that class in the squad."
- **Player-requested classes** — any squadmate can click "Request Medic" (etc.). A requested class shows **+15% XP** on unpicked players' screens. First-pick-wins. Reward doesn't stack past +15%.
- Class can be freely changed until countdown ends.
- **Countdown auto-deploys** when it hits 0.
- If a player hasn't picked by deploy time → defaults to their last-played class (or Assault on first-ever match).
- Cosmetic equip UI does **not** live here in MVP — deferred to Phase 3.

### Match place (reserved server)

- Separate Roblox place, reserved via `TeleportService:ReserveServerAsync`.
- `TeleportAsync` moves the whole squad with `TeleportOptions.SetTeleportData` carrying mission + class assignments.
- Server writes `match:{accessCode}` to MemoryStore **before** teleport (recovery anchor if teleport fails).
- Match server re-reads MemoryStore on boot — never trusts `GetJoinData().TeleportData` as authoritative. Kicks any player not in the stored roster.
- Mission runs. When it ends: per-class XP applied, everyone teleports back to hub.
- MVP version: baseplate + `TextLabel` showing class + End Match button.

---

## Classes (5 — locked)

Every class shares: same R15 baseline, same HP (except Vanguard), same revive interaction. Identity comes from **primary weapon + sidearm + special tool + movement profile**. No active abilities, no cooldowns, no skill trees.

| Class | Primary | Sidearm | Special tool | Movement | Body |
|---|---|---|---|---|---|
| **Assault** | Assault rifle | Pistol + frag grenades | — | Standard | R15 standard |
| **Medic** | SMG | Pistol | Heal beam (continuous heal on aimed teammate) | Fast move + high jump | R15 standard |
| **Engineer** | Shotgun | Pistol | Scanner tool (toggle: Build mode / Resupply mode) | Standard | R15 standard |
| **Recon** | Sniper rifle | **Sword** | — | Standard | R15 standard |
| **Vanguard** | Flamethrower | **Gauntlets** (default: basic metal) | — | Slow + slow weapon swap | R15 oversized + heavy armor (more HP) |

### Engineer's scanner tool

**Build only.** Aim at flat surface, hold to construct turret or wall (gated by ore budget — see Base building). Resupply is handled by the Orbital Uplink (anyone can call ammo drops, not just Engineer).

### Class identity by squad role

| Class | Squad problem solved |
|---|---|
| Assault | Generalist DPS. Always useful. The default. |
| Medic | Sustain — heal beam mid-fight + fastest revive |
| Engineer | Fortify — turrets + walls. Anyone can call ammo via Orbital Uplink. |
| Recon | Long-range pickoff (sniper) — sword for self-defense in tight spaces |
| Vanguard | Frontline crowd control — flamethrower wipes swarms, gauntlets crush brutes |

Without each role, the squad has a hole. Without Engineer specifically: no in-mission resupply at all.

---

## Orbital Uplink (call-in support system) — **DEFERRED post-MVP, economy open in OPEN.md**

**Status:** Design intent preserved below, but the economy is no longer Honor-powered (see Monetization section). Needs redesign before shipping — likely a separate in-match "Supply" resource earned from kills/objectives, not tied to Honor. Tracked as an OPEN.md item. Does not ship in MVP.

Replaces Engineer's resupply mode. Engineer's scanner tool is now **Build only** (turrets, walls).

### How it works

Squad earns **Honor** in-mission (kills, objectives, civilians saved). Any player opens the **Orbital Uplink** menu mid-mission, spends Honor → support drops at their marker location from the squad's orbiting vessel.

- No pre-mission picks. All call-ins always available.
- No fixed cooldowns. Spending is gated by Honor earned.
- Player is vulnerable while menu is open (can't shoot).
- Drops arrive ~10s after request.

### Launch call-in menu

| Call-in | Honor cost | Effect |
|---|---|---|
| Ammo Drop | 50 | Crate falls — anyone refills primary + sidearm |
| Med Drop | 75 | Crate falls with med-kits |
| Sentry Drop | 100 | Auto-turret falls, lasts 60s |
| Airstrike | 150 | Aerial bombing run on beacon area, ~50m line of impact |
| Backup Squad | 200 | NPC Guardians spawn briefly to assist |
| Vehicle (Phase 5+) | 300 | Drop-pod with traversal/combat vehicle |

### Honor earn rates per kill

| Enemy | Honor earned |
|---|---|
| Larva | 2 |
| Thrall | 5 |
| Spewer / Cling / Burster | 10 |
| Maul / Spawner / Stalker | 30 |
| Brood Warden / Hive Lord | 100 |
| Sector Commander | 500 |
| The Maw | 5000 |

Plus civilian-saved bonuses, objective bonuses, mission completion bonus.

### Honor as dual-purpose currency — **SUPERSEDED**

Earlier design had Honor as in-mission + meta currency. Superseded by the two-currency model in the Monetization section: **XP earned from play, Honor purchased with Robux.** Uplink call-ins will use a separate in-match resource (deferred).

Friendly fire is **OFF** — airstrikes and sentries can't team-kill, making call-ins more usable than Helldivers-style stratagems.

---

## Revive system

When a player drops to 0 HP, they're **downed** (not dead). Bleeds out over 30s if not revived. Medic can also be downed and revived — no special case.

| Reviver | Time to revive |
|---|---|
| Medic | 4s |
| Anyone else | 12s |

Reviver is vulnerable while reviving (can't shoot). If all 4 players are downed simultaneously, mission fails.

## Mission loop

1. Squad assembles in lobby / war map
2. Pick a sector + mission type from the shared planet map
3. Drop in
4. Complete objective (varies by mission type)
5. Extract
6. Outcome contributes to sector status on the server-wide campaign

Target session length: 15–30 min per mission.

## Difficulty tiers (5 — locked)

Player picks a difficulty per mission. Higher difficulty = more dangerous parasite tiers + better Honor rewards.

| Tier | Vibe | Allowed enemy tiers |
|---|---|---|
| **Sweep** | Routine patrol, easy, training-wheels | Drones + Specialists |
| **Operation** | Standard deployment, expected resistance | + Heavies |
| **Crisis** | Things have escalated, sometimes a Champion shows up | + Champion (sometimes) |
| **Outbreak** | Hive activity is dense, Champions guaranteed | + Champion (always) |
| **Total Loss** | Sector finale missions only — face a Sector Commander | + Sector Commander (sector finales only) |

Honor reward scales with difficulty (placeholder multipliers, tune in playtest):
- Sweep ×1.0 / Operation ×1.5 / Crisis ×2.0 / Outbreak ×2.75 / Total Loss ×4.0

---

## Mission types at launch

Three types. Each is its own designed loop. Same core combat + tools — only the objective logic differs.

### Purge Hive (formerly Assault Nest)
- Squad pushes through parasite tunnels to a Hive Queen chamber
- Destroy the Queen / egg-sac
- Extract
- Biome: **Hive interior** (organic tunnels, dark, tight)
- Emphasis: offense, movement, ammo management
- No civilians, no base-building required

### Hold the Plaza (formerly Defend Outpost)
- Squad protects alien civilians evacuating a city plaza
- Build defenses during a prep window
- Survive escalating waves of parasites
- Extract on timer or after final wave
- Biome: **Alien city**
- Emphasis: base building, positioning, civilian protection
- Civilians are passive NPCs; Medic can heal them too (objective bonus)

### Evacuation Run (replaces Reclaim Base / Liberate District)
- Squad escorts a group of ~15 alien civilians through a destroyed city section to a waiting evac shuttle
- Civilians follow the squad in a loose group; can be picked off by parasites
- Mobile escort under fire — squad must clear path forward AND protect civilians simultaneously
- Biome: **Alien city ruins** (destroyed, smoke, debris, fallen buildings)
- Emphasis: mobile escort, crowd protection, retreat-while-fighting

**Civilian death penalty (locked):**
- Each civilian death reduces end-of-mission Honor reward
- Each civilian death reduces this sector's contribution to the shared planet campaign
- All 15 civilians dying = mission **fails** + sector loses ground in the global war
- Saving all 15 = bonus Honor + maximum sector contribution

## Base building

- Happens **during** missions, not persistent between them.
- Resource: ore (collected from deposits scattered on map).
- Deposited at refineries to unlock build budget.
- Buildable pieces: walls, bunkers, turrets, ammo stations, HQ structure, medical station.
- Modular kit — ~12 pieces at launch. Snap/grid placement.
- Starship Troopers: Extermination is the reference for this loop.

## Enemies — Parasite Army (6-tier hierarchy)

The parasites are a **real military force**, not a bestiary. They have rank, structure, and a chain of command. Players fight up the hierarchy across the campaign. Custom meshes (not R15) — generated via Tripo → processed in Blender → rigged. All deaths use ragdoll physics (no death animations).

### Tier 1 — Drones (bulk infantry, mass-bred)

| Name | Role | Behavior | Field count |
|---|---|---|---|
| **Larva** | Tiny swarm | Weak individually, overwhelms by count | 30+ |
| **Thrall** | Rusher swarm | Infested alien host, sprints + melee, dies fast | 20–40 |

### Tier 2 — Specialists (trained combat roles)

| Name | Role | Behavior | Field count |
|---|---|---|---|
| **Spewer** | Ranged | Bloated parasite, lobs acid projectiles | 5–10 |
| **Cling** | Aerial harasser | Small winged parasite, dives + clings/bites | 3–5 |
| **Burster** | Exploder | Sprints at squad and detonates (acid AOE) | 2–4 |

### Tier 3 — Heavies (assault + siege units)

| Name | Role | Behavior | Field count |
|---|---|---|---|
| **Maul** | Heavy | Massive infested host, armored carapace, slow + tanky | 1–3 |
| **Spawner** | Stationary unit producer | Spits out Larvae continuously — destroy to stop swarm | 1–2 |
| **Stalker** | Cloaked ambusher | Invisible from range, ambushes from cover | 1–3 |

### Tier 4 — Champions (mid-bosses, end-of-mission encounters in Phase 4+)

Lieutenants commanding hive sub-units. Appear at end of harder missions.

| Name | Role |
|---|---|
| **Brood Warden** | Heavily armored elite, summons Larvae waves |
| **Hive Lord** | Massive beast, leads Maul packs |

### Tier 5 — Sector Commanders (regional generals — Phase 5+)

One unique commander per major planet sector. Appear as boss of each sector's final liberation mission. 4–6 unique designs at Campaign 1 launch (working names — final names TBD):

- **The Voidcaller** — psychic command unit
- **The Bloodmother** — birthing chamber boss
- **The Conclave** — multi-headed coordinator
- **The Devourer**
- **The Stillborn**
- **The Architect**

### Tier 6 — The Hive Queen (Campaign 1 finale)

| Name | Role |
|---|---|
| **The Maw** | Singular progenitor + central will of the parasite army on this planet |

**Queen Gate:** The Maw cannot be fought until the **shared planet campaign reaches a global progress threshold** (X% of sectors liberated across all servers). Until then, she remains uncontactable. When the gate opens, every server runs the Queen finale until campaign 1 ends.

### Difficulty × tier mapping

Higher difficulties unlock more dangerous tiers:

| Difficulty | Drones | Specialists | Heavies | Champions | Sector Cmdr | Queen |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Sweep | ✅ | ✅ |  |  |  |  |
| Operation | ✅ | ✅ | ✅ |  |  |  |
| Crisis | ✅ | ✅ | ✅ | sometimes |  |  |
| Outbreak | ✅ | ✅ | ✅ | ✅ |  |  |
| Total Loss | ✅ | ✅ | ✅ | ✅ | sector finale only |  |
| **Queen Gate** (campaign finale) | — | — | — | — | — | ✅ |

### Director AI

Per-mission director controls wave pressure based on squad state (health, ammo, position) within the difficulty's allowed tier roster. Director never spawns enemies above the difficulty's allowed tier.

### Phased rollout for enemy art + AI

| Phase | New tiers shipped | Running total |
|---|---|---|
| 3.1 | Thrall | 1 |
| 3.2 | + Larva | 2 |
| 3.3 | + Maul | 3 |
| 3.4 | + Spewer, Burster, Spawner | 6 |
| 3.5 | + Cling, Stalker | 8 |
| 4 | + Brood Warden, Hive Lord (Champions) | 8 + 2 mid-bosses |
| 5 | + first 2 Sector Commanders | 8 + 2 + 2 |
| 6 | + remaining Sector Commanders + The Maw unlock conditions | full roster |

## Player character

- **R15 rig** — standard Roblox avatar for all classes.
- Vanguard uses an oversized R15 with heavy armor mesh attachments (still R15 underneath — no custom skeleton).
- Customization via HumanoidDescription (helmet, vest, uniform colors).
- Same asset pipeline Iron Empires already uses for its rifleman preview.
- No custom skeletons for players.

## Weapons + combat

- Third-person shooter feel.
- Ammo scarcity is a design lever (creates tension, drives base-building refuel loop).
- Combat feel polish is the single biggest craft investment — plan for 6+ weeks of tuning.

## Shared campaign

- One persistent planet map visible in every lobby.
- Sectors have status: Secure / Contested / Overrun.
- Mission outcomes across all servers shift sector status.
- Weekly story beats advance the war.
- Campaign participation rewards: badges, titles, exclusive cosmetics.

## Progression + monetization

### Player progression
- Ranks gained from mission participation (Rookie → Senior → Veteran → Elite Guardian).
- **XP is per-class** (locked) — each class levels independently.
- **Starter weapon per class is free + always available** (e.g., Assault rifle for Assault).
- **At alpha launch: 1 weapon per class only.** Unlockable variants come in post-alpha content drops.
- Additional weapons unlock via class-level XP gains.

### Weapon design rule (critical)
**All weapons within a class are sidegrades, not upgrades.** Different feel, different use case (e.g., Assault might unlock a burst rifle, an SMG-style carbine, a battle rifle — each better for *some* situations, none strictly stronger). No paying player ever has a strict damage advantage.

### Monetization (locked — two-currency model)

| Currency | Source | Spends on |
|---|---|---|
| **XP** (per-class) | Mission play only. Reward bonuses from pre-match "needed class" +10% and "requested class" +15%. | Class levels → unlock new weapons for that class (post-alpha) + class-specific cosmetic slots |
| **Honor** | Robux purchase only (MVP). No in-game earning. No gifting in MVP. | Cosmetic skins in the lobby shop (Phase 3+) |

- **No pay-to-win surface.** Weapons are XP-gated, not Honor-gated. Honor only buys visual cosmetics. This is cleaner than the old "Robux → Honor → weapon unlocks faster" design.
- **Sidegrade rule still applies** — every weapon unlocked by XP is a sidegrade, not an upgrade.
- Campaign rewards = exclusive cosmetics + badges + titles (earn-only, not purchasable).
- **Gifting is deferred post-MVP.** When it ships: gift **items** (specific cosmetics), not Honor. Rationale: items are reversible on refund (revoke the skin), currency is not (already spent on something else).
- **Orbital Uplink call-ins no longer run on Honor** — needs a new in-match resource, deferred.

### Lobby shop (Phase 3+, not in MVP)
- Located in the hub lobby UI.
- Spend Honor on: cosmetic variants per class.
- Weapons unlock via XP progression, not shop purchase.

### Cosmetic system (single global pattern)
One unified system across every weapon in the game (rifles, pistols, SMGs, shotguns, sniper, sword, gauntlets, flamethrower). Each weapon has N visual variants — purely visual, mechanically identical. Build the system once, apply everywhere.

## Procedural generation

**Model: Layered templates with randomized slots.** Not "infinite random maps." Reference: Helldivers 2 (outdoor) + Deep Rock Galactic (tunnels).

### 5-step generation

1. **Mission template (hand-designed)** — each mission type has a fixed *spine*: drop zone → tunnel/path → mid-objective → boss arena → extract zone. Order, pacing, beat count is fixed.
2. **Slots in the template (constrained)** — each spine point is a slot with rules (e.g., "tunnel section: 30–60m long, 1+ branch off").
3. **Modular kit (15–20 prefab pieces per biome)** — hand-built MeshParts with metadata tags (size, type, entrances, theme).
4. **Stitch + validate** — generator picks pieces, snaps entrances, validates connectivity (no dead ends, every region reachable).
5. **Decoration + spawn pass** — scatter props within bounded regions, place enemy spawn zones by density rules, place pickups + ore deposits + refineries at piece anchors.

### Seed-locked

Each mission has a seed. Server generates from template + kit + seed → all 4 squad members see the same map. Replays + bug reports re-run with the same seed = same map.

### Code structure

```
src/server/world/
  ├── TemplateRegistry.ts    -- mission templates (hand-defined)
  ├── KitRegistry.ts         -- prefab pieces + metadata
  ├── Generator.ts           -- (template + seed) → map
  └── DecorationPass.ts      -- scatter props + spawns post-stitch
```

### Performance budget

- Cap **~80 piece instances per map**
- Roblox streaming + LOD for far pieces
- Pre-cache all pieces in `ReplicatedStorage` at server start
- Generation runs once at mission start (~1–2s), not per-frame
- No runtime CSG

### Phased build

| Phase | Generator state |
|---|---|
| 3.1 | None — fixed gray-box test arena, no generator |
| 3.4 | First template + 6 hive kit pieces + Generator v1 (Purge Hive only) |
| 4 | + Alien city kit (10 pieces) + Hold the Plaza template + Evacuation Run template (uses ruined-city variant) |
| 5+ | Expand kits per biome, add weather + time-of-day variants |

## Tech approach (high-level)

- **roblox-ts + Flamework** (same stack as Iron Empires).
- **R15** for players.
- **MemoryStoreService** for shared real-time planet state.
- **DataStoreService** for long-term campaign + player data.
- **MessagingService** for cross-server news/alerts.
- 4 players per server (mission lobby scale).

## Asset pipeline

- **Players:** R15 + Roblox catalog cosmetics.
- **Enemies:** AI-generated mesh → Blender retopo + rig → FBX → Roblox MeshPart.
- **Structures:** AI-generated or purchased kit → Blender cleanup → Roblox MeshPart.
- **Terrain:** Roblox terrain tool + modular prop kit (rocks, alien plants, cliffs).
- **Weapons:** Generated or hand-modeled, simple MeshPart welded to player hand.

Asset requests follow a spec-sheet format (use, scale, animations needed, rig structure). Batched by category (all enemies together, all building pieces together).

## Team division of labor

- **Ahmad:** production, design direction, coding (with Claude).
- **Team:** 3D asset generation + Blender cleanup.
- **Claude:** implementation, systems, combat tuning, shared state engineering.

---

## Phased rollout (classes + missions)

| Phase | Classes shipped | Missions | Why this order |
|---|---|---|---|
| **3.1** | Assault only | 1 gray-box arena (combat slice) | Prove combat feel with one class first |
| **3.2** | + Medic | Same arena | Adds healing + revive systems |
| **3.3** | + Vanguard | Same arena | Adds heavy weapons + slow movement profile |
| **3.4** | + Engineer | First Purge Hive mission | Adds build tool + auto-turret + ammo box |
| **3.5** | + Recon | Purge Hive complete | Adds sniper + sword melee |
| **4** | All 5 | + Hold the Plaza (alien city + civilians + base-building waves) | City biome + civilian AI |
| **5** | All 5 | + Liberate District (escort + room-clearing) | Escort logic + VIP AI |

Phase 3 starts with **just Assault, no resupply system**, generous ammo. Combat feel is the gate. No other system ships until shooting feels good.

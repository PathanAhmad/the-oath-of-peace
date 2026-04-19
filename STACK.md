# Tech stack — decisions + rationale

Committed tech choices. Each has rationale so future-Claude + future-Ahmad understand why.

**Critical:** Do not scaffold config files from memory. Run the install/init commands referenced here with context7-verified current docs. See CLAUDE.md Hard Rule #18.

---

## Core language + framework

### roblox-ts

TypeScript that compiles to Luau. Type safety catches errors at compile time.

**Why:**
- Ahmad already uses it on Iron Empires — zero re-learning cost
- Scales better than pure Luau for a project with enemy AI, shared state, procedural gen
- Editor support (VS Code + Claude Code) is better for TS than Luau
- Industry standard for serious Roblox dev in 2026

**Docs to fetch:** context7 `roblox-ts` before first scaffold

---

### Flamework

Dependency injection + service framework for roblox-ts.

**Why:**
- Clean service/controller separation (server services, client controllers)
- Lifecycle management (OnStart, OnTick)
- Reflection metadata for testing and validation
- Official template exists: `npx degit rbxts-flamework/template`
- Already used on Iron Empires

**Install:** `npx degit rbxts-flamework/template .` (from the project root — when ready)

---

## Networking

### ByteNet (primary choice)

Binary packed networking for Roblox. Rate limiting + schema + compression built in.

**Why:**
- Much more bandwidth-efficient than RemoteEvents (critical for 50-enemy replication)
- Type-safe schemas (compile-time guarantees client ↔ server stay aligned)
- Rate limiting is first-class
- Proven on high-traffic games

**Alternative considered:** Flamework's built-in Net package. Good, but ByteNet beats it on bandwidth for our shooter use case.

**Docs to fetch:** context7 `ffrostflame/bytenet` before first use

---

## Enemy simulation

### Matter (ECS)

Entity-Component-System framework for Roblox.

**Why:**
- Performance at 50+ enemies requires cache-friendly data layout, not OOP spaghetti
- Great for swarm behaviors (position + velocity + state components)
- Debug tooling (matter-hoarcekat) is excellent
- Scales naturally — 50 enemies or 500 use the same systems

**Alternative considered:** OOP-style enemy classes. Simpler for beginners but dies at ~30 active enemies on mid-tier hardware.

**Docs to fetch:** context7 `matter-ecs/matter` before first use

---

## UI

### Vide (reactive)

Modern reactive UI library for roblox-ts.

**Why:**
- Vide components are simple functions — minimal boilerplate
- Reactive state flows naturally for HUDs (ammo, health, objective markers)
- No virtual DOM overhead
- Smaller bundle than Fusion/Roact

**Alternative considered:** Fusion (good, slightly more complex API), Roact (older, Facebook-era React clone).

**Docs to fetch:** context7 `centau/vide` before first use

---

## Persistence

### ProfileStore

DataStore wrapper with session locking, automatic retries, schema versioning.

**Why:**
- Session locking prevents duplication exploits
- Automatic retry with backoff
- Schema migration support for when the data model evolves
- Industry standard — used by major Roblox games

**Alternative considered:** Raw DataStoreService (don't — we'll lose data), ProfileService (similar, ProfileStore is the modern successor).

**Docs to fetch:** context7 `madstudioroblox/profilestore` before first use

---

## Shared campaign state

### MemoryStoreService + DataStoreService (Roblox native)

- **MemoryStoreService** for real-time shared planet state (current sector status, active lobby count per sector)
- **DataStoreService** for durable campaign state (which sectors have been liberated historically)
- **MessagingService** for real-time "news" alerts across servers

**Critical:** Shard keys. Never one monolithic "planet state" key — partition limits throttle us. See VALIDATION.md for the pattern.

**Docs:** Roblox official creator-docs (no context7 needed, first-party)

---

## Testing

### TestEZ (or jest-roblox)

Behavior-driven testing framework for Roblox.

**Why:**
- Matches the `describe/it/expect` pattern devs already know
- Roblox-compatible (runs inside Studio)
- Works with Flamework's reflection for dependency mocking

**Docs to fetch:** context7 `roblox-ts/testez-companion` before first test file

---

## Build + tooling

### Rojo

File system ↔ Roblox place sync.

**Why:** Standard Roblox workflow. Source in git, sync to Studio.

**Docs to fetch:** context7 `rojo-rbx/rojo` before writing `default.project.json`

---

### pnpm

Package manager.

**Why:** Faster, stricter dependency resolution, same workflow as Iron Empires.

**Docs to fetch:** none needed, standard

---

### Rokit

Roblox toolchain manager (replaces aftman).

**Why:** Manages Rojo, Wally, StyLua, Selene versions per-project.

**Docs to fetch:** context7 `rojo-rbx/rokit` before writing `rokit.toml`

---

### ESLint + Prettier

Code quality.

**Why:** Consistent style, catch bugs, enforce rules (no-any, no-console, etc.).

**Docs to fetch:** context7 before writing `eslint.config.*`

---

## Code quality tools

### StyLua + Selene

Luau linting/formatting for any raw Luau files (Rojo project files, legacy scripts).

**Why:** Industry standard for Luau code quality.

---

## Decisions NOT yet made

These are open — fetch current docs before choosing:

- **Logging library:** Console.log wrapper? Structured logging via `@rbxts/log`? TBD
- **Config management:** How environment configs (dev/staging/prod) are swapped
- **Analytics backend:** Roblox Analytics? Third-party? GameAnalytics?
- **Voice chat implementation:** Native SpatialVoice? Audio API beta?

---

## When starting the scaffold (next chat's first job)

1. Read CLAUDE.md Hard Rule #18
2. Fetch `flamework template` via context7
3. Run `npx degit rbxts-flamework/template .` in the project root
4. Fetch current docs for each library in this STACK.md via context7 BEFORE adding it to package.json
5. Commit the scaffold with a clear message
6. Verify `pnpm check` passes on the empty scaffold
7. Only then write first real code

**Do not try to scaffold from this document alone.** It's a commitment to choices, not a drop-in config.

---

## Phase 0 lessons (carried from Iron Empires)

1. **Library churn is real.** roblox-ts 3.x ≠ 2.x. Flamework transformer config changes. Don't trust training data.
2. **Templates > field-by-field config.** First context7 query for any new lib: "does it have a starter template?"
3. **Implicit dependencies bite.** Check what `@rbxts/*` packages each lib expects.
4. **Rokit PATH on Windows is finicky.** Restart terminal after install.
5. **HTTP pre-baking matters.** Enable HTTP service in place settings if using HttpService.

---

## Budget / cost impact

All listed tools are **$0 or one-time $15 max**. Stack is free-tier compatible for MVP.

| Tool | Cost |
|---|---|
| roblox-ts, Flamework, ByteNet, Matter, Vide, ProfileStore, TestEZ | $0 (MIT/similar open source) |
| Rojo, Rokit, pnpm | $0 |
| ESLint, Prettier, StyLua, Selene | $0 |
| VS Code, Claude Code | $0 (you have Claude Max) |

Zero dependency spend. Real-money costs (when they happen) are: Roblox monetization (post-launch), optional paid MCPs/AI tools (Phase 2+).

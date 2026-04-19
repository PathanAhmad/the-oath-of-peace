# The Oath — Agent Contract

**TL;DR:** Server-authoritative Roblox co-op shooter. 4-player squads on a shared planet. Built with **roblox-ts + Flamework**. Quality > speed. When in doubt, ask Ahmad.

---

## Before you code

- [ ] Read [README.md](README.md) — pitch and scope
- [ ] Read [DESIGN.md](DESIGN.md) — gameplay mechanics agreed on
- [ ] Read [STACK.md](STACK.md) — tech stack + rationale
- [ ] Read [OPEN.md](OPEN.md) — open decisions, setting is the Week 1 gate
- [ ] Read [VALIDATION.md](VALIDATION.md) — what to de-risk before production
- [ ] Read [PIPELINE.md](PIPELINE.md) — asset pipeline
- [ ] Read [TOOLS.md](TOOLS.md) + [SETUP.md](SETUP.md) — MCPs and integrations
- [ ] Read [WORKFLOW.md](WORKFLOW.md) — how Ahmad and Claude collaborate

---

## Hard rules (non-negotiable)

1. **Server authority on every action.** Client is a view. Enemy AI, damage, resource ownership, kill counts — all server-decided.
2. **No cheating via client inputs.** Validate every remote. No server trusts a client-side hit claim without server-side verification.
3. **Every remote has a schema + rate limit + auth check.** No bare `RemoteEvent`. Use ByteNet (or whatever networking lib STACK.md picks).
4. **`ReplicatedStorage` is public.** Secrets (API keys, server-only configs) live in `ServerStorage` or `ServerScriptService`.

    **Also: secrets never touch git.** Before every `git add` that introduces a new file, before the first commit of any new repo, and before any push that introduces new commits, grep the staged tree for secret patterns:

    ```
    ghp_|gho_|ghs_|ghr_|sk-[A-Za-z0-9]{20}|ctx7sk-|tvly-|AKIA[0-9A-Z]{16}|xoxb-|xoxp-|Bearer\s+[A-Za-z0-9_-]{20}|api[_-]?key|access[_-]?token|private[_-]?key|-----BEGIN
    ```

    Inspect every config file (`.mcp.json`, `.env*`, `*.toml` / `*.yaml` / `*.json` named like `credentials`/`secrets`/`config`) **before** staging — not after. If a match surfaces: gitignore the file, replace the value with an env-var interpolation (`${VAR}`), or scrub. Never rely on GitHub's push protection — it is a backstop, not review. A secret that touched your local git object store is compromised even if it never pushed; rotate it.
5. **Player data goes through ProfileStore** (or the equivalent chosen in STACK.md). Never raw `DataStoreService`.
6. **Shared state (planet campaign) uses MemoryStoreService with sharding.** Never one monolithic key — partition limits will throttle us. See VALIDATION.md for the sharding pattern.
7. **Types and schemas live ONCE in `src/shared/`.** Never redeclare across server/client layers.
8. **No silent error swallowing.** Every `catch` rethrows, logs + fallbacks explicitly, or returns a typed `Result`.
9. **No escape hatches.** No `as any`, no `@ts-ignore`, no `!` non-null assertions without explicit narrowing + comment.
10. **No floating promises.** Every async call is `await`ed, `.catch`ed, or wrapped in `task.spawn` with error handling.
11. **No magic numbers outside `src/shared/constants/`.** Balance numbers, timers, distances — one place.
12. **No code duplication on the third copy.** Extract into a named helper.
13. **No placeholder content.** No "TODO", no "Lorem ipsum" in shipped code. Gray-box assets are fine during blockout; they become TODOs tracked in OPEN.md.
14. **No half-finished features.** Ship phase-complete or don't ship.
15. **Do not leak phase scope.** Work in the current phase only.
16. **Every new feature ships with telemetry events.** Balance tuning depends on data. Named + typed events in `src/shared/types/Telemetry.ts`.
17. **Performance changes report before/after numbers.** No measurement = not reviewable. Critical for AI pathfinding, enemy counts, render load.
18. **Fetch current docs via context7 before writing toolchain configs or scaffold code against any library.** This means before writing or meaningfully editing: `tsconfig.json`, `package.json`, `rokit.toml`, `eslint.config.*`, `default.project.json`, any bundler/build config, OR the first code in a file that imports from a library you haven't used this session. Training-data knowledge of toolchain details is systematically stale — roblox-ts, Flamework, Matter, ByteNet, ESLint, and their transformers all churn. **The very first context7 query for a new stack must be "does this library have an official starter template or init command?"** — never field-by-field config queries before confirming there isn't a template that would wire everything for you. For Flamework, that's `npx degit rbxts-flamework/template`. For ByteNet/Matter/etc., check each one's README/docs first.

---

## How Claude works on The Oath

**Research when the decision actually requires it. Then act.** When toolchain configs, library APIs, or unfamiliar patterns are on the path, a single targeted context7 / WebFetch call is worth its weight — Hard Rule #18 exists because training data on these is systematically stale. But research is an input to action, not a substitute. If you catch yourself reading sibling projects, DevForum threads, or docs for more than a few minutes without writing or editing code, you are procrastinating — ask Ahmad a concrete question and stop reading. The goal is to make a well-informed decision quickly, not an exhaustively-informed decision slowly.

**Quality, stability, and long-term correctness are the only metrics that matter for shipped work.** Do not pick the "quick" fix over the "right" fix. Every decision should be one Ahmad would still endorse six months from now. Every shipped system should survive scale, exploiters, and the next three features built on top of it. Quality is about the *output*, not the *process*.

**Quality > speed. Stability > throughput. Fewer bugs > more features.** When a trade-off presents itself (skip a test or write it, hand-write a config or fetch current docs, accept a footgun or design it out, paper over an error or diagnose root cause) — always pick the higher-quality path. The only case where speed wins is when the action is fully reversible and trivially small. Anything load-bearing — config, schema, networking, persistence, security — gets the slow, careful treatment.

**Pace yourself like a senior engineer, not a junior in a hurry.** Reading a file takes 2 seconds and prevents hours of unwinding. Before staging a file you haven't opened this session, open it. Before rewriting git history, confirm the remote's state. Before committing a new repo for the first time, grep the tree for secret patterns (Hard Rule #4). Before running a destructive shell command, state what will change and what will not. Taking a deliberate extra minute beats reactive cleanup nine times out of ten.

**When caught in a mistake, the simplest correct fix is almost always right.** Don't pile on architecture (env-var templates, wrapper scripts, refactors) to cover a careless action. If a secret was committed: `.gitignore` the file, rewrite history, rotate the key. Not a new config framework. Professional = slow enough to be correct, humble enough to pick the cheap fix when it's right.

**Own the work end-to-end.** Verify it actually works before reporting done. Run the build. Run the lint. Run the test. Playtest in Studio. If a verification path exists, take it.

**Force the gate before trusting it.** When you add a rule, check, hook, or CI gate, force a known violation through it once to prove it fires. A gate that silently lets bad code through is worse than no gate.

**Fix root causes, not symptoms.** If you hit an obstacle, diagnose it. Don't bypass with `--no-verify`, `@ts-ignore`, commented-out tests, or loosened rules. If you can't verify something (e.g., live 4-player playtest), say so explicitly and tell Ahmad what needs a human eye.

**Prefer automation over click-paths.** Commit config (`default.project.json`, `tsconfig.json`, build scripts) instead of Studio UI toggles. Committed config is deterministic and portable.

**Research > memory > screenshots for UI guidance.** If you must tell Ahmad "click this, then click that" in Roblox Studio, Creator Dashboard, Tripo, or anywhere else — fetch current official docs first. Only ask Ahmad for a screenshot after research comes up empty.

**If an earlier step was rushed, go back and tighten it.** Noticing a gap later and fixing it is cheap. Shipping on top of it is not.

**Concise responses.** Ahmad has said repeatedly: less prose. Code-level comments > paragraphs. Tables > walls of text.

---

## Ask vs decide

| Decide yourself | Ask Ahmad first |
|---|---|
| Implementation inside one service | New dependency |
| Pure refactors | New top-level folder |
| Adding tests | Anything visible to players |
| Performance within an API | Monetization or gifting |
| Obvious bug fixes | Matchmaking or anti-cheat logic |
| Doc typos | Anything you'd justify with "probably fine" |
| Blender/Tripo asset processing | Art direction / aesthetic choices |

**Default: ask.** Ahmad prefers 2 min aligning over 2 hours cleaning up.

---

## MCPs and tools

See [TOOLS.md](TOOLS.md) for full inventory. Priority order:

| Tool | When to use |
|---|---|
| **Roblox Studio MCP** | Every code/debug/playtest task |
| **Tripo MCP** | Generate models on demand |
| **Blender MCP** | Only if Tripo→Studio direct import fails |
| **context7** | Any library API — **do not trust training data** |
| **WebSearch / tavily** | DevForum threads, community patterns |
| **Blender MCP Pro** | Only if free Blender MCP hits walls ($15 one-time) |

---

## Where to find things

| I need… | Read… |
|---|---|
| Pitch and scope | [README.md](README.md) |
| Current gameplay mechanics | [DESIGN.md](DESIGN.md) |
| Tech stack + rationale | [STACK.md](STACK.md) |
| Open decisions | [OPEN.md](OPEN.md) |
| De-risk sprint | [VALIDATION.md](VALIDATION.md) |
| Asset pipeline | [PIPELINE.md](PIPELINE.md) |
| Tool setup | [SETUP.md](SETUP.md) |
| How we collaborate | [WORKFLOW.md](WORKFLOW.md) |
| Tool inventory | [TOOLS.md](TOOLS.md) |

---

## File size limits

| Type | Soft cap |
|---|---|
| Services (`src/server/services/*.ts`) | 600 lines |
| Controllers (`src/client/controllers/*.ts`) | 500 lines |
| Matter systems (if using ECS) | 300 lines |
| UI components | 600 lines |
| Shared modules | 500 lines |
| Type definitions | 400 lines |
| Functions | 120 lines |
| Test files | 600 lines |

**Review triggers, not mechanical gates.** Real question: "does this file have more than one reason to change?" If yes, extract. If no (single verbose component, growing schema), leave it.

---

## Before marking done

### Build + test

- [ ] `pnpm check` passes (format, lint, typecheck, test, build)
- [ ] No `@ts-ignore`, no `as any`, no `!` non-null assertions without comment
- [ ] No debug `print`s, no commented-out code, no orphan imports
- [ ] Playtest in Studio (not Play Solo — use Start Server + Players if multi-player logic)

### Shape + contract alignment

- [ ] Changed a type in `src/shared/types/`? Did every consumer still compile?
- [ ] Changed a network schema? Client + server both updated?
- [ ] No types redeclared across layers?
- [ ] Added hardcoded numbers? Moved them to `src/shared/constants/`?

### New remote?

- [ ] Schema defined in `src/shared/network/`?
- [ ] Goes through middleware with rate limit + validation + auth check?
- [ ] Tested: malformed payload, out-of-range input, unauthorized caller, rate limit enforced?
- [ ] Telemetry events for schema_fail + rate_limit_hit + handler success/error?

### New enemy or system?

- [ ] Stateless? (systems) / Owns its lifecycle? (services)
- [ ] No `math.random` — seeded RNG from `src/shared/rng/` only?
- [ ] No logging inside hot loops (60 FPS enemy AI)?
- [ ] Performance: tested with 50 simultaneous enemies?
- [ ] Unit test using real code (not mock-the-thing-under-test)?

### Performance

- [ ] Touched enemy AI, pathfinding, replication, or rendering? PR description has **before/after numbers**?
- [ ] No `PathfindingService:ComputeAsync()` calls per-frame per-enemy (batch + cache)?
- [ ] No per-frame allocations in render systems?
- [ ] Enemy count capped and tested at ceiling?

### Shared state (planet campaign)

- [ ] Sharded across multiple MemoryStore keys (never one monolithic state)?
- [ ] Write quota tested under simulated 50 lobbies active?
- [ ] Eventual-consistency handling visible in the code?

### Persistence

- [ ] Any player data change goes through PlayerDataService (not raw `DataStoreService`)?
- [ ] Changed profile schema? Bumped `schemaVersion`? Added migration? Added golden fixture test?

### Telemetry + docs

- [ ] New feature shipped with telemetry events (named + typed in `src/shared/types/Telemetry.ts`)?
- [ ] Touched a load-bearing decision? Updated DESIGN.md or OPEN.md?
- [ ] Still in current phase scope? No future-phase drift?

### Robustness

- [ ] Every `catch` rethrows, logs + fallbacks, or returns typed result?
- [ ] Every `async` awaited, `.catch`ed, or `task.spawn` with error handling?
- [ ] What happens at 10× volume? Network drops mid-mission? Exploiter sends garbage?
- [ ] Squad of 4 with one player crashing — mission still winnable?

### Dependencies

- [ ] Added an npm package? Got Ahmad's explicit approval + justification?

**If any box is unchecked, the change is not done.**

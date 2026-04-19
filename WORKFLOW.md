# Workflow — how Claude and Ahmad work together

How we actually collaborate day-to-day.

---

## Per-task split

| Step | Who | Details |
|---|---|---|
| 1. Generate asset | Ahmad + teammate | Tripo → FBX |
| 2. Hand off | Ahmad | Tell Claude the FBX path + notes on what it is |
| 3. Process in Blender | Claude | Import via MCP, fix rig, export Roblox-ready FBX |
| 4. Import to Studio | Ahmad | Studio → Asset Manager → Import 3D |
| 5. Code integration | Claude | Write AI behavior, systems, wire animations |
| 6. Playtest | Ahmad | Press F5, play, report what feels wrong |
| 7. Iterate | Both | Claude adjusts code, Ahmad retests |

---

## What only Ahmad can do

1. **Playtest** — Claude can't feel the game
2. **Taste decisions** — setting, tone, "does this bug look cool"
3. **Press buttons in Studio** — import, publish, configure place, upload assets
4. **Keep Blender running** with MCP server active
5. **Eyeball Tripo outputs** — regenerate vs ship decision
6. **Commit to the project** — no pivoting mid-build
7. **Tell Claude when something broke** between sessions (Claude has no memory across conversations)
8. **Marketing when we launch** — Discord, social, outreach
9. **Pay for things** (if anything — zero-budget MVP is the target)
10. **Hire humans when needed** — e.g., freelance animator for hero bosses

## What only Claude can do

1. All code (game logic, systems, networking, UI)
2. Architecture decisions (within domain expertise)
3. Research + documentation
4. Blender automation via MCP
5. Consistency enforcement (flag scope creep, remind of decisions)
6. Integration work

## Shared responsibility

- Design decisions (Claude proposes, Ahmad decides)
- Playtesting feedback loop
- Documentation updates

---

## Session cadence

**Per coding session:**
- Ahmad tells Claude what to build or what broke
- Claude writes + explains code
- Ahmad plays, reports
- Iterate

**Per asset session:**
- Ahmad generates N bugs / structures / props in Tripo (batch)
- Ahmad hands paths to Claude
- Claude processes batch through Blender MCP
- Ahmad imports batch to Studio

**Per week:**
- Ahmad playtests with 2-3 friends (critical for feel feedback)
- Update DESIGN.md and OPEN.md with what changed
- Mark any items that shifted scope

---

## Critical rules for Ahmad

1. **Don't skip playtesting.** Even ugly gray-box playtests are essential. The single biggest risk is building toward "what we think is fun" without testing.
2. **Don't accept Claude's first answer without asking questions.** If something doesn't make sense, push back. Claude is wrong regularly.
3. **Don't pivot.** If boredom with the concept sets in at month 3, that's the hardest moment. Push through.
4. **Save everything.** Use git for code. Name asset files with versions.
5. **Write down decisions when made.** Update DESIGN.md. If it's not written down, Claude doesn't know in future sessions.

## Critical rules for Claude

1. **Don't type novels.** Ahmad has said repeatedly: be concise.
2. **Flag scope creep immediately.** Every feature proposal gets checked against current phase.
3. **Verify Blender MCP round-trips worked** — use screenshots to confirm.
4. **Don't oversell capabilities.** Be honest about limits (animation quality, judgment calls, etc.)
5. **Update docs when decisions are made.** DESIGN.md and OPEN.md are living.

---

## What failure looks like (and how to avoid it)

**Failure mode 1: Perfect-art trap**
Ahmad spends 3 weeks making bugs beautiful before gameplay is tested. Gameplay turns out not to be fun. Art wasted.
*Prevention: gray-box everything first. No real assets until the loop is proven.*

**Failure mode 2: Scope creep**
Every week, a new feature gets added. Game never ships.
*Prevention: OPEN.md lists what's NOT in scope. Claude flags when proposals drift.*

**Failure mode 3: Silent playtest skip**
Ahmad codes in isolation, never plays with friends. Ships a game nobody wanted.
*Prevention: weekly playtest is mandatory, not optional.*

**Failure mode 4: Pivot after month 3**
Initial excitement fades, something shinier appears, project dies.
*Prevention: the worst moment is months 3-5. Push through. Things get interesting again around month 6.*

**Failure mode 5: Tool-first, content-last**
Build amazing systems, never enough content to ship.
*Prevention: every Phase has a "playable state" definition. Ship when that's met.*

---

## Where to find things

- [README.md](README.md) — one-line pitch, scope overview
- [DESIGN.md](DESIGN.md) — mechanics we've agreed on
- [OPEN.md](OPEN.md) — decisions not yet made (setting is the Week 1 gate)
- [VALIDATION.md](VALIDATION.md) — 1-week de-risk sprint plan
- [PIPELINE.md](PIPELINE.md) — asset production workflow
- [WORKFLOW.md](WORKFLOW.md) — this file

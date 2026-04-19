# Startup — what the new chat does first

For the fresh Claude session starting in this folder. Run through in order.

---

## Pre-flight (before any real work)

- [ ] Read CLAUDE.md
- [ ] Read README.md, DESIGN.md, OPEN.md
- [ ] Read STACK.md, PIPELINE.md, TOOLS.md, SETUP.md, WORKFLOW.md, VALIDATION.md
- [ ] Confirm with Ahmad which of the MCPs are actually installed (run `/mcp`, paste results)

---

## Session 1 goals

### Goal 1: Lock the setting

**The single most blocking open decision.** Options:
- Bugs (Starship Troopers)
- Robots (Terminator-ish)
- Demons (hell invasion)
- Undead (zombie biohazard)
- Feral humans (post-apocalyptic)
- Something else

Every asset prompt, every art decision, every name flows from this. Pick one, write it into DESIGN.md, move on.

**Needed from Ahmad:** 5 minutes of taste conversation, final pick.

---

### Goal 2: Run validation sprint item 1 (pipeline test)

See VALIDATION.md for full sprint plan. Item 1 is the pipeline round-trip.

**Procedure:**
1. Ahmad generates 1 hexapod creature in Tripo with `hexapod:walk` preset
2. Ahmad hands the FBX path (or lets Claude drive via Tripo MCP if installed)
3. Claude attempts direct Roblox Studio import via Studio MCP
4. Screenshot result, validate:
   - Does it appear in Studio?
   - Does the rig import correctly?
   - Does the walk animation play?
5. Decision:
   - **Works cleanly:** skip Blender, pipeline is Tripo → Studio, commit
   - **Issues:** specific failure → decide Blender fix-up vs Tripo settings tweak

**Timeboxed:** one evening.

---

### Goal 3: Scaffold the code project

Only after Goal 2 proves the asset pipeline works.

Follow Hard Rule #18: context7 first.

**Procedure:**
1. Context7 query: "does rbxts-flamework have an official template?"
2. Run `npx degit rbxts-flamework/template .` in the project root
3. Verify the scaffold compiles (`pnpm install`, `pnpm build`)
4. Context7 each library in STACK.md before adding to package.json
5. Commit the clean scaffold as the baseline

---

## Session 2-5 goals (approximate)

Depending on how session 1 goes:

- **Finish validation sprint** — items 2, 3, 4 from VALIDATION.md (rig compat, performance, voice chat)
- **Decision review** — commit to production, adjust scope, or pivot
- **If committing:** start Phase 1 gray-box vertical slice (one mission type, placeholder assets, playable loop)

---

## What Ahmad should have ready for session 1

- [ ] Tripo account logged in, API key ready
- [ ] Roblox Studio installed with Studio MCP Server configured (per SETUP.md)
- [ ] VS Code + Claude Code ready in the project folder
- [ ] 1-2 hours of focused time
- [ ] Willingness to LOCK the setting this session

---

## What NOT to do in session 1

- Don't write game code yet (scaffolding is fine, actual systems no)
- Don't generate a dozen Tripo assets — one hexapod to test pipeline
- Don't debate the setting for more than 30 minutes — pick and move
- Don't skip context7 before writing any config file
- Don't add an MCP that wasn't in SETUP.md without discussing

---

## Red flags for the new Claude

If Ahmad tries any of these, push back:

- "Let's change the genre" — check against the history in chat; we've cycled through 6+ concepts. Commit.
- "Skip the validation sprint and just start coding" — no. The 1-week sprint exists specifically because scope commitment without tech validation is how indie games die.
- "Add [new feature] before we have a vertical slice" — scope creep. Flag it, log to OPEN.md, keep building.
- "Do the setting decision tomorrow" — no. This blocks everything. Session 1 lock.

---

## Concise communication expectations

Ahmad has explicitly said: "you type so much" / "so many words" / "no slop."

**Rules of the road:**
- Answers in tables, bullet points, or short paragraphs — not essays
- Lead with the answer, not the reasoning
- If the question is yes/no, start with "yes" or "no"
- One-sentence session summaries, not three-paragraph wrap-ups
- Ask before adding features, propose before implementing big changes

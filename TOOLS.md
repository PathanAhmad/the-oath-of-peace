# Tools inventory — free and paid stack

Research on what's available to maximize Claude's direct control and minimize Ahmad's manual work.

---

## Tier 1: Install immediately (free, high leverage)

### 1. Roblox Studio MCP Server (built-in, free)

**What it does:**
Roblox built native MCP support into Studio as of Feb 2026. Claude can directly:
- Run Lua code in Studio
- Insert models from Creator Store
- Monitor console output
- Manage playtest cycles
- Read/edit scripts
- Explore game structure
- **Generate textured 3D meshes from text prompts** (new March 2026)
- Take viewport screenshots to see what's happening

**Why it's massive:**
I stop being "code-writer who hands files to Ahmad" and become "developer working in Studio directly." Ahmad still has to press F5 to play and report feel issues, but import/debug/iterate is mine.

**Install:**
Download binary → restart apps → Claude sees Studio. ~60 seconds.

**Cost:** $0

Source: [Official Roblox Studio MCP announcement](https://devforum.roblox.com/t/assistant-updates-studio-built-in-mcp-server-and-playtest-automation/4474643), [docs](https://create.roblox.com/docs/studio/mcp)

---

### 2. Blender MCP (ahujasid, free)

**Already covered in VALIDATION.md / PIPELINE.md.**

Free version handles everything via `execute_blender_code` Python escape hatch. $15 Pro adds purpose-built tools but not required.

Source: [github.com/ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp)

---

### 3. Tripo MCP Server (official, free — uses Tripo account)

**What it does:**
Official MCP server from Tripo's makers. Claude can generate 3D models from text prompts directly, they auto-import into Blender.

**Why useful:**
For simple props (rocks, alien plants, ambient clutter, structure pieces), I can generate them on-demand without Ahmad touching Tripo. Ahmad only handles hero assets (bugs, bosses) where eyeball decisions matter.

**Install:**
Python 3.10+, Blender, Tripo Blender Addon, Tripo API key.

**Cost:** $0 (uses Tripo free tier credits)

Source: [github.com/VAST-AI-Research/tripo-mcp](https://github.com/VAST-AI-Research/tripo-mcp)

---

### 4. Roblox Assistant built-in mesh generation (free)

**What it does:**
Built into Studio. Type `/generate [description]` or ask conversationally — textured 3D mesh appears in seconds.

**Why useful:**
For placeholder/gray-box assets and quick iteration, this is faster than Tripo round-trips. Not as high quality as Tripo for hero assets, but genuinely usable for filler.

**Cost:** $0 (included in Studio)

Source: [Roblox Assistant mesh generation](https://devforum.roblox.com/t/assistant-updates-mesh-generation-new-mcp-server-tools-screenshot-tool-and-more/4527258)

---

## Tier 2: Install when relevant (free / tiny cost, medium leverage)

### 5. ElevenLabs MCP Server (free tier, $5/mo+ for better)

**What it does:**
Official MCP server for ElevenLabs. Claude can:
- Generate sound effects from text descriptions
- Generate voice lines for NPCs / narrator
- Generate ambient audio loops
- Up to 30-second clips with seamless looping
- 48 kHz professional quality

**Quality:**
Rated best AI SFX in 2026. Pro sound designers rate it "indistinguishable from recorded foley" in blind tests.

**License:**
- Free tier: attribution to elevenlabs.io required
- Paid tier: full royalty-free commercial, no attribution

**Why useful:**
For a bug shooter we need: bug screeches, gunshots, footsteps, ambient alien atmosphere, UI clicks, explosions, voice lines for narrator/comms. I can generate all of these on demand.

**Cost:** $0 free tier / ~$5/month for commercial use without attribution

Source: [ElevenLabs MCP GitHub](https://github.com/elevenlabs/elevenlabs-mcp), [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects)

---

### 6. Free PBR texture generators (no MCP, but integrate via Blender)

**Tools:**
- **GenPBR** — free, algorithmic (not AI) for consistency
- **AITextured** — 10,000+ free AI-generated seamless textures
- **3D AI Studio PBR Map Generator** — free, instant normal/roughness/height/AO maps from images
- **ZSky AI** — 50 free credits daily, no signup, wood/stone/metal/fabric
- **Polyhaven** — CC0, pre-made PBR sets

**Why useful:**
Modular base-building kits, terrain pieces, bug chitin surfaces, structure walls — all need PBR texturing. Claude can drive these via Blender MCP (generate texture URL, download, apply via SurfaceAppearance).

**Cost:** $0

Sources: [GenPBR](https://genpbr.com/), [AITextured](https://aitextured.com/), [3D AI Studio PBR](https://www.3daistudio.com/Tools/PBRMapGenerator)

---

### 7. Playwright MCP (free)

**What it does:**
Lets Claude browse/interact with the web via accessibility snapshots. Navigate, click, fill forms, extract data.

**Why useful for this project:**
- Scrape reference imagery for Tripo prompts (e.g., "show me 20 images of sci-fi bunkers" → use as image-to-3D inputs)
- Monitor competitor Roblox games for inspiration
- Auto-fetch DevForum posts for technical reference
- Download free asset packs automatically

**Cost:** $0

Source: Playwright MCP — standard tool in Claude Code ecosystem

---

### 8. Firecrawl MCP (free tier)

**What it does:**
Fetches URLs and returns clean markdown.

**Why useful:**
Getting clean Roblox API docs, DevForum threads, tutorials into my context when researching specific problems. Complement to WebSearch for deep dives.

**Cost:** Free tier generous

---

## Tier 3: Paid but worth it (when the project grows)

### 9. Suno AI (music generation) — $10-20/mo

**What it does:**
AI music generation from text prompts. Full songs with vocals or instrumental tracks.

**Commercial license:**
- Free tier: songs playable/shareable only (CANNOT download)
- Pro ($10/mo): commercial rights, downloads allowed
- Premier ($30/mo): higher limits

**Why useful:**
Campaign theme music, tense mission scores, victory stingers, menu ambient. Avoid Suno's 2026 deprecated models — use the new licensed models (Warner Music Group deal settled legal issues).

**Caveat:**
AI-generated music can have commercial rights but usually can't be copyrighted (US). You can sell, but can't enforce copyright against someone else using the same track.

**Alternative:**
Epidemic Sound at $20/mo — traditional licensed music, more defensible, maybe less novel.

**Cost:** $10-30/mo depending on tier

Source: [Suno commercial rights guide 2026](https://terms.law/ai-output-rights/suno/)

---

### 10. Blender MCP Pro — $15 one-time / $5/mo

**Already covered.** Worth it if the free version hits limits during rigging/animation cleanup. $15 one-time is trivial.

---

### 11. Tripo Pro — ~$20/mo

**When to upgrade:**
If free tier credits run out during active production. Pro gives more generation credits per month.

**Alternative:**
Stay on free tier, Ahmad generates in bursts when he has credits available. Pace production to free tier limits.

---

## Tools I have or will have

After installing Tier 1:

| Tool | Status | Capability |
|---|---|---|
| WebSearch | ✅ have | Real-time research |
| Filesystem | ✅ have | Read/write project files |
| Roblox Studio MCP | Install | Direct Studio control |
| Blender MCP | ✅ have (or easy install) | Automate Blender |
| Tripo MCP | Install when useful | Generate 3D via text |
| Playwright MCP | Install if useful | Web automation |
| ElevenLabs MCP | Install Phase 2 | Generate audio |

Everything else is optional.

---

## The new workflow with these tools

**Old workflow (what I described before):**
1. Ahmad generates bug in Tripo → 2. hands FBX to Claude → 3. Claude processes in Blender → 4. Ahmad imports to Studio → 5. Claude writes code → 6. Ahmad playtests

**New workflow (with full tool stack):**
1. Ahmad says "we need a hexapod warrior bug" → 2. Claude generates in Tripo via MCP → 3. Claude imports to Blender via MCP, processes, exports Roblox FBX → 4. Claude inserts into Studio via Studio MCP → 5. Claude writes code + wires animations → 6. Ahmad playtests, reports feel issues

Ahmad's manual work drops from ~40% of asset pipeline to ~10%. He becomes eyeball-approver, playtester, and taste-maker. Claude does the mechanical work.

---

## What still needs Ahmad no matter what

The ToolSearch MCP doesn't change these:
- Playtest feel feedback
- Taste decisions ("does this bug look cool")
- Committing to the project (not pivoting)
- Hiring freelancers if needed
- Marketing + community
- Publishing / monetization decisions
- Eyeballing Tripo outputs — even if I generate them, Ahmad decides "regenerate or ship"

---

## Recommended install order

**Week 1 (before starting project):**
1. Roblox Studio MCP (the big unlock)
2. Blender MCP (free version)
3. Tripo MCP (if using Tripo)

**Phase 2 (when production ramps):**
4. ElevenLabs MCP (when we need real SFX)
5. Free PBR texture tools (when environment pass starts)

**Phase 3 (when polishing):**
6. Blender MCP Pro ($15) if free version hits walls
7. Tripo Pro if credit limits bite
8. Suno or Epidemic Sound when music matters

---

## Sources

- [Roblox Studio MCP Server official docs](https://create.roblox.com/docs/studio/mcp)
- [Roblox Studio going agentic announcement](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)
- [Roblox Assistant mesh generation](https://devforum.roblox.com/t/assistant-updates-mesh-generation-new-mcp-server-tools-screenshot-tool-and-more/4527258)
- [Tripo MCP Server](https://github.com/VAST-AI-Research/tripo-mcp)
- [Blender MCP (ahujasid)](https://github.com/ahujasid/blender-mcp)
- [ElevenLabs MCP Server](https://elevenlabs.io/blog/introducing-elevenlabs-mcp)
- [ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects)
- [Free PBR texture tools — GenPBR](https://genpbr.com/), [AITextured](https://aitextured.com/), [3D AI Studio](https://www.3daistudio.com/Tools/PBRMapGenerator)
- [Suno commercial licensing guide](https://terms.law/ai-output-rights/suno/)
- [50+ Best MCP Servers for Claude Code 2026](https://claudefa.st/blog/tools/mcp-extensions/best-addons)
- [Best Free MCP Servers 2026](https://toolradar.com/blog/free-mcp-servers)

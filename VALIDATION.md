# Validation sprint

Before committing 12+ months to production, we verify 4 technical assumptions. This doc captures research findings + what to test.

**If any of these fail, we either adjust scope or pivot *before* burning real time.**

---

## De-risk item 1: Tripo → Blender → Roblox FBX pipeline

### What we're testing
Generate one Tripo hexapod bug → process via Blender MCP → import to Roblox Studio → confirm it walks.

### What research says about compatibility

**Tripo FBX outputs:**
- Uses standard humanoid bone naming conventions (may need renaming for non-humanoid creatures)
- Exports FBX with skeleton + baked animations
- Supports multi-legged presets: `quadruped:walk`, `hexapod:walk`, `octopod:walk`, `serpentine:march`, `aquatic:march`

**Roblox FBX import requirements (confirmed):**
- ≤ 4 bone influences per vertex
- All bone transforms must be frozen (scale 1,1,1; rotation 0,0,0)
- Individual mesh triangle cap: ~10K (Batch Import) to ~21K (single Import 3D)
- Forward = Z, Up = Y

**Known gotchas:**
- Bone naming mismatches are the most common import failure
- Hierarchies sometimes import as "InitialPoses only" instead of bones (Roblox bug, workarounds exist)
- Export settings matter: Apply Scaling with FBX Unit Scale, Smoothing Face, Apply Modifiers, Only Deform Bones, Bake Animation

### Sprint actions
1. Ahmad generates 1 hexapod bug in Tripo with `hexapod:walk` preset
2. Claude imports via Blender MCP, runs `diagnose_rig` to check structure
3. Claude normalizes bone names, freezes transforms, re-exports FBX
4. Ahmad imports to Roblox Studio, confirms rig + animation
5. If walking works: pipeline proven. If not: capture specific failure, iterate.

### Bonus finding
**Official Tripo MCP server exists** ([github.com/VAST-AI-Research/tripo-mcp](https://github.com/VAST-AI-Research/tripo-mcp)). Combined with Blender MCP, the entire pipeline could be Claude-driven: describe bug in natural language → Tripo generates → Blender imports automatically → Claude processes → export. Worth investigating in sprint.

---

## De-risk item 2: Tripo rig → Roblox FBX compatibility

### What we're testing
That Tripo's auto-rigged output meets Roblox's strict FBX requirements without requiring extensive manual cleanup per bug.

### Expected problem areas
- **Vertex weights exceeding 4 bone influences** — Tripo's rigging may weight vertices to 5+ bones for smooth deformation. Roblox caps at 4. Requires a limit-and-normalize pass.
- **Non-frozen transforms** — Tripo exports may have non-1 scale or non-zero rotation on the armature. Blender script pass fixes this.
- **Bone naming** — Tripo uses humanoid convention. For hexapods, we'll want semantic names (e.g., `L_Leg_1_A`, `L_Leg_1_B`, etc.) for animation targeting in Roblox.

### Sprint actions
1. Measure vertex weight distribution on a Tripo hexapod (how many vertices have > 4 influences)
2. Write a Blender Python fix-up script (callable via MCP) that:
   - Limits weights to top 4 per vertex, renormalizes
   - Applies all transforms (freezes scale/rotation)
   - Renames bones to a Roblox-friendly convention
   - Exports with correct Roblox FBX settings
3. Verify the processed FBX imports to Roblox without warnings

### Mitigation if it fails
We write a standardized "Tripo-to-Roblox" Blender script that runs on every bug. One-time cost, reusable forever.

---

## De-risk item 3: Performance budget at mission scale

### What we're testing
Whether 4 players + 50 active enemies + 20 base structures + mission geometry runs at acceptable framerate on mid-tier hardware.

### What research says

**NPC pathfinding cost (from ToolBLX calculator):**
- Baseline assumption: 6 path recalculations per NPC per minute, ~60 stud paths
- 20 NPCs ≈ 24% pathfinding load
- **~42 NPCs ≈ 50% load — the practical ceiling for naive PathfindingService use**

**Optimization techniques for >40 NPCs (documented):**
- `BulkMove` API for position updates without physics recalc
- Zone-based NPC activation (deactivate out-of-range enemies)
- Path caching for common routes
- Client-side pathfinding for non-combat enemies
- Spatial hashing for collision checks

**Recent Roblox improvements:**
- March 2025: PathfindingService got memory + performance improvements
- Engine performance gains are ongoing; 50-player servers (beta 700) are the direction of travel

### Sprint actions
1. Build a gray-box mission: 4 dummy players + 50 procedural enemies + 20 structures
2. Profile on mid-tier hardware (GTX 1660 / 16GB RAM tier)
3. Measure: server fps, client fps, network usage, memory
4. Test variations:
   - 30 active enemies (conservative target)
   - 50 active enemies (aspirational target)
   - 80 active enemies (swarm moment target)
5. Identify where the knee of the performance curve is

### Design implications by result
- **Holds at 50 active:** ship original design
- **Holds at 30, struggles at 50:** cap active enemy count, use zone activation (enemies spawn as you approach)
- **Struggles at 30:** reduce enemy density, lean harder on scripted scenarios vs open swarms

---

## De-risk item 4: Voice chat spatial audio (2026 state)

### What we're testing
That Roblox's spatial voice supports the "hear enemies through walls / hear teammates on comms" design assumption.

### What research confirms

**Spatial Voice is live and documented:**
- Proximity-based audio: volume scales with distance
- Audio fades as distance increases
- Works with 3D positioning automatically

**2026 voice categories:**
- **Spatial Voice** — proximity-based in-experience chat ✅ what we want
- **Experience Voice Chat** — developer-enabled voice within specific game
- **Party Chat** — for grouped players (pre-mission)
- **Trusted Connections** — high-security friend chat

**New Audio API (beta):**
- Gives developers controls over sound and voice
- Supports team chat and walkie-talkie functionality
- Means we can build "comms" (always-on team voice) separate from Spatial Voice (proximity voice)

**Eligibility barriers (important):**
- Mandatory global age check: ID verification OR facial age check required for voice access (January 2026+)
- Means a % of our target audience can't use voice
- Design implication: game must be fully playable without voice; voice is additive

**Platform support:**
- Desktop (Windows, macOS)
- Mobile (iOS, Android)
- Console (PS5, PSVR2)
- VR (Meta Quest 2, 3, Pro)

### Sprint actions
1. Create test place with 2 accounts + spatial voice enabled
2. Confirm proximity fade works correctly
3. Test the Audio API beta for "team comms always-on" channel
4. Verify mobile works (a significant part of Roblox audience)

### Design implications
- Comms layer: always-on for squad of 4 (Audio API)
- Spatial layer: hearing monsters approach, hearing enemy players in future PvP expansions
- Accessibility: text chat + visual indicators must cover voice-disabled players

---

## Additional research findings (not in original 4)

### MemoryStoreService reality check

**Quota formula:** 1000 + 100 × CCU request units per minute

**Critical documented issue:**
Developers report throttling **even when well below documented quota limits**. Root cause appears to be per-partition limits — if you concentrate writes on one key, you hit partition limits before hitting global quota.

**Design implication:**
The shared planet state CANNOT be one key. We shard. Planet → sectors → per-sector key. War updates go to individual sector keys, not a monolithic planet state. Campaign-level aggregation happens via periodic batch reads.

**Action item during Phase 3 (meta layer):**
Architecture review with focus on write-sharding pattern before implementing the shared campaign.

### Mixamo licensing confirmed

- **Free, no royalties, no attribution required**
- Commercial use allowed in embedded project form
- Only restriction: can't redistribute animations as standalone assets, can't train ML models on them
- RoMixamo plugin exists for one-click Roblox integration

### Tripo cost reality

- Tripo has a free tier (limited credits/month)
- Paid tier for heavy use
- Official MCP server exists — could automate asset generation entirely through Claude + Blender MCP pipeline

---

## Sprint schedule (1 week)

| Day | Item | Outcome |
|---|---|---|
| 1-2 | Item 1: Pipeline round-trip | Tripo bug walking in Roblox, or specific failure captured |
| 3 | Item 2: Rig compatibility + fix-up script | Reusable Blender script for all future bugs |
| 4-5 | Item 3: Performance benchmark | Real numbers for enemy count ceiling |
| 6 | Item 4: Voice chat verification | Spatial + Audio API state confirmed |
| 7 | Decision review | Commit, adjust, or pivot |

---

## Decision criteria at end of sprint

**Commit to production if:**
- Pipeline round-trip works end-to-end
- Performance holds at ≥ 30 active enemies
- Voice chat spatial works as expected
- No unresolvable blockers identified

**Adjust scope if:**
- Performance caps at < 30 enemies → reduce enemy counts, more scripted moments
- Tripo rig needs heavy per-bug cleanup → accept slower art throughput
- Voice chat has adoption gap → design voice as optional enhancement only

**Pivot if:**
- Pipeline fundamentally broken (unlikely given research)
- Performance caps at < 15 enemies (unlikely)
- Roblox removes spatial voice (not going to happen)

---

## Sources

- [Roblox Mesh Requirements](https://create.roblox.com/docs/building-and-visuals/external-modeling/mesh-requirements)
- [Tripo AI export to Roblox guide](https://www.tripo3d.ai/blog/export-ai-3d-model-to-roblox)
- [Tripo MCP server — GitHub](https://github.com/VAST-AI-Research/tripo-mcp)
- [Tripo animation presets](https://platform.tripo3d.ai/docs/animation)
- [Roblox Spatial Voice FAQ](https://en.help.roblox.com/hc/en-us/articles/4405807645972-Voice-FAQ)
- [New Audio API beta announcement](https://devforum.roblox.com/t/new-audio-api-beta-elevate-sound-and-voice-in-your-experiences/2848873)
- [Roblox Pathfinding Cost Calculator — ToolBLX](https://toolblx.com/tools/pathfinding-cost-calculator)
- [MemoryStore throttling real-world issues](https://devforum.roblox.com/t/memorystoreservice-requests-throttling-despite-not-being-near-limit/2810573)
- [MemoryStore best practices](https://github.com/Roblox/creator-docs/blob/main/content/en-us/cloud-services/memory-stores/best-practices.md)
- [Mixamo licensing FAQ](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/td-p/13234775)

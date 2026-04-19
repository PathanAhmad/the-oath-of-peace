# Asset pipeline

How we produce game assets from idea to in-game.

---

## Division of labor

| Role | Person | Tasks |
|---|---|---|
| Generation | Ahmad (+ teammate) | Generate models in Tripo, hand over FBX |
| Eyeball check | Ahmad | Decide "regenerate" vs "acceptable" |
| Processing | Claude (via Blender MCP) | Import, fix weights, rename bones, re-export |
| Roblox integration | Claude + Ahmad | Claude writes code, Ahmad imports + playtests |
| Hero animations | Teammate (learning Blender) | 5-10 custom animations that Tripo doesn't cover |

---

## Tools + cost

| Tool | Cost | Role |
|---|---|---|
| Tripo (free tier) | $0 | Generate rigged + animated bug models |
| Blender | $0 | Asset cleanup, custom animations |
| Blender MCP (free `ahujasid` version) | $0 | Claude controls Blender via Python exec |
| Mixamo | $0 | Free humanoid animation library, retargetable |
| Roblox Studio | $0 | Game engine + publishing |
| Polyhaven | $0 | PBR textures, HDRIs |
| Freesound, Pixabay Music | $0 | SFX + music |

**Total MVP budget: $0.**

Optional upgrades later (only if free tier hits a wall):
- Blender MCP Pro: $15 one-time (better rigging/animation tools)
- Tripo Pro: ~$20/mo (more generation credits)
- Epidemic Sound: ~$20/mo (pro music library)
- Freelance animator: $100-300 for 3-5 hero animations

---

## Tripo export settings (for Roblox compatibility)

When exporting from Tripo:
- Format: **FBX** (for rigged/animated), OBJ (for static props)
- Include skeleton: **yes**
- Include animations: **yes** (bake into FBX)

Tripo's auto-rig uses humanoid bone conventions. For non-humanoid creatures (hexapod, quadruped), we'll normalize bone names in the Blender pass.

---

## Blender processing step (Claude via MCP)

For each incoming FBX, Claude runs a standardized pipeline:

1. Import FBX into Blender
2. Run `diagnose_rig` (Blender MCP Pro) or equivalent Python check:
   - Verify bone hierarchy is valid
   - Flag vertices with > 4 bone influences
   - Check for zero-weight vertices
3. Fix-up pass:
   - Limit vertex weights to top 4 per vertex, renormalize
   - Apply all transforms (scale 1,1,1 — rotation 0,0,0)
   - Rename bones to Roblox-friendly convention
   - Ensure Y-up / Z-forward axis
4. Re-export FBX with settings:
   - Apply Scaling: FBX Unit Scale
   - Forward: Z Forward
   - Up: Y Up
   - Smoothing: Face
   - Apply Modifiers: enabled
   - Only Deform Bones: enabled
   - Bake Animation: enabled
5. Hand back to Ahmad: FBX path + notes on any issues

---

## Roblox import step (Ahmad)

1. In Studio: Asset Manager → Import 3D → select FBX
2. Verify rig imports correctly (all bones present, animation data intact)
3. Save as `Model` in ReplicatedStorage/Enemies/
4. Note the MeshId and AnimationIds Claude will need to reference

---

## Animation strategy

**Roblox-native animation (free, zero work):**
- Player character (R15 built-in animations)
- Bug death (ragdoll physics via Motor6D + BallSocketConstraint)
- UI (TweenService)

**Tripo-provided animation (free, comes with model):**
- Bug walk / run (per preset: hexapod, quadruped, etc.)
- Bug basic attack (if preset includes it)

**Mixamo retarget (free, unlimited):**
- Humanoid enemy movement + combat
- Hero character cinematic poses

**Teammate-crafted (free, time investment):**
- 3-5 hero boss animations
- Bug-specific attacks that Tripo doesn't include well
- Narrative / cutscene animations

---

## Enemy design principles (to keep pipeline feasible)

Design enemies to lean on what the pipeline already does well:

1. **Prefer bipedal / near-humanoid** where possible — Mixamo animation library is massive for this shape
2. **6-legged bugs are good** — Tripo has a `hexapod:walk` preset
3. **Avoid 8+ legs unless Tripo has the preset** — harder to animate
4. **Death = ragdoll always** — no death animations needed
5. **Attack = simple lunge or projectile spawn** — can be keyframed in minutes
6. **Reserve custom animation budget for 1-2 hero bosses only**

---

## Batch workflow

Don't process one asset at a time. Batch by category:

- **All 4-5 bug types in one session** — Claude processes the whole roster at once
- **Full base-building kit in one session** — all 12-15 modular pieces processed together
- **Full environment prop kit in one session** — rocks, alien plants, etc.

Reason: Claude designs the integration systems (AI behavior trees, snap/grid placement, terrain spawners) to fit the *full* set. Piecemeal delivery causes rework.

---

## Versioning

When regenerating an asset (bug v1 looked wrong, Ahmad regenerates v2):
- File name: `warrior_bug_v2.fbx`, not overwrite `warrior_bug.fbx`
- Claude's game code references the latest version
- Old versions stay in Archive/ for reference

This prevents silent breakage when assets change mid-project.

---

## First pipeline test (validation sprint, day 1-2)

The single deliverable that proves this pipeline works:

> One hexapod bug from Tripo, processed through Blender MCP, imported to Roblox Studio, walking in the workspace on a gray-box floor.

If this works in one evening, the pipeline is validated and we can produce assets at scale. If it doesn't, we capture the specific failure and decide how to fix or adjust.

---

## Sources

- [Tripo export to Roblox guide](https://www.tripo3d.ai/blog/export-ai-3d-model-to-roblox)
- [Roblox Mesh Requirements](https://create.roblox.com/docs/building-and-visuals/external-modeling/mesh-requirements)
- [Mixamo FAQ / commercial use](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/td-p/13234775)
- [Blender to Roblox FBX best practices](https://grokipedia.com/page/Best_practices_for_importing_FBX_files_from_Blender_to_Roblox)

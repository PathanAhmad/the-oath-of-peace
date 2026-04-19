# Setup — step by step

Do these in order. Each tool has an install, verify, and "what Claude needs" section.

**Before anything:** Close Claude Code / Claude Desktop while editing MCP config files. Restart after each change.

---

## Strategy

**Install only what's needed, when it's needed.** Start with the two essential tools. Add more only if a specific wall appears.

Priority order:
1. **Roblox Studio MCP** — essential, direct control over Studio
2. **Tripo MCP** — since you have Tripo, makes asset generation Claude-driven
3. **Validation test** — generate 1 bug in Tripo, import directly to Studio, see if it works
4. **Blender MCP** — only if direct Tripo→Studio import fails
5. **ElevenLabs MCP** — Phase 2, when audio work starts
6. Paid upgrades — only when a free tool hits a wall

---

## Prerequisites (do once)

- [ ] Python 3.10+ installed
- [ ] `uv` package manager: `pip install uv` (Windows) or `curl -LsSf https://astral.sh/uv/install.sh | sh` (Mac/Linux)
- [ ] Roblox Studio installed
- [ ] VS Code installed (Claude Code runs inside it)
- [ ] Git installed
- [ ] Tripo account + API key ready ([tripo3d.ai](https://www.tripo3d.ai/))

Confirm in terminal:
```bash
python --version
uv --version
```

**Blender is NOT required up front.** Install only if Step 3 fails.

---

## 1. Verify what's already configured

You're on Claude Max with VS Code + Claude Code. Some MCPs may already be active.

### Check active MCPs

In VS Code with Claude Code, run:
```
/mcp
```

Note what's there. Paste results into our next chat.

### Locate MCP config file

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- Or project-specific: `.mcp.json` in repo root

Open it. We'll add entries here.

---

## 2. Roblox Studio MCP Server (essential — install first)

### What it gives Claude
- Run Lua code in Studio
- Insert models from Creator Store
- Monitor console output
- Manage playtest cycles
- Read/edit scripts
- Generate 3D meshes via Studio Assistant
- Take viewport screenshots

### Install

1. Go to [create.roblox.com/docs/studio/mcp](https://create.roblox.com/docs/studio/mcp) for official docs
2. Download the Studio MCP Server binary
3. Install the Studio plugin that ships with it (enable in Studio's plugin manager)
4. Note the binary path — you'll need it for config

### Configure Claude Code

Add to your MCP config JSON:

```json
{
  "mcpServers": {
    "roblox-studio": {
      "command": "path/to/roblox-studio-mcp",
      "args": []
    }
  }
}
```

Replace `path/to/roblox-studio-mcp` with the actual binary path.

### Verify

1. Open Roblox Studio with any place (test baseplate is fine)
2. Confirm the Studio plugin is enabled
3. Restart Claude Code
4. In new chat: `/mcp` should show `roblox-studio`
5. Test: ask me "insert a red Part into the workspace." If it appears in Studio, integration works.

### What Claude needs from Ahmad

- [ ] Binary path after install
- [ ] Studio plugin enabled (check plugin manager)
- [ ] Studio must be open with a place loaded during sessions

---

## 3. Tripo MCP Server (essential — you have Tripo already)

### What it gives Claude
- Generate 3D models from text prompts directly
- Auto-import generated assets
- Manage Tripo generation jobs
- Drive the full asset pipeline without Ahmad touching Tripo UI for every asset

### Get your Tripo API key

1. Log into [tripo3d.ai](https://www.tripo3d.ai/)
2. Profile → API Keys → Create new key
3. Copy the key (I never see it; it lives in your config)

### Install Tripo MCP

```bash
uvx install tripo-mcp
```

Or:
```bash
pip install tripo-mcp
```

### Configure Claude Code

Add to MCP config:

```json
{
  "mcpServers": {
    "tripo": {
      "command": "uvx",
      "args": ["tripo-mcp"],
      "env": {
        "TRIPO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Replace the key with your actual key.

### Verify

Restart Claude Code. Ask me: "generate a simple rock model in Tripo." If a generation job starts and completes, the integration works.

### What Claude needs from Ahmad

- [ ] Tripo API key pasted into config
- [ ] Tripo credit balance note (so I know pacing — free tier is limited)
- [ ] `assets/models/generated/` folder in the project for outputs

---

## 4. Validation test — does Tripo → Studio work directly?

**Do this before installing Blender.**

### The test

1. Ask me: "generate one hexapod bug in Tripo with the `hexapod:walk` animation preset, then insert it into Roblox Studio."
2. I'll chain Tripo MCP → Studio MCP
3. Check result:
   - **Bug appears in Studio and walks?** ✅ Skip Blender entirely. Pipeline works.
   - **Bug imports but rig/animation breaks?** Note the specific error. Probably need Blender for fix-up (go to Step 5).
   - **Import fails entirely?** Note the error. Decide whether to fix in Blender or adjust Tripo export settings.

### Likely outcomes

- **60-70% chance this works cleanly.** Tripo outputs game-ready topology. Modern Roblox Studio FBX import handles most common rigs.
- **If it works:** we never install Blender. Pipeline is Tripo → Studio, fully Claude-driven.
- **If it doesn't:** we install Blender MCP for the fix-up pass.

### What Claude needs from Ahmad

- [ ] Run the test, screenshot the result, paste failures (if any) into chat
- [ ] Decision: commit to pipeline path (direct or via Blender)

---

## 5. Blender MCP — ONLY if Step 4 fails

Skip this section unless validation test showed Tripo→Studio has issues.

### Install

**Blender itself:**
- Download Blender 3.6+ from [blender.org](https://www.blender.org/download/)
- Install

**Blender addon:**
1. Download `addon.py` from [github.com/ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) (Releases → latest)
2. Blender → Edit → Preferences → Add-ons → Install → select `addon.py`
3. Enable "Interface: Blender MCP" checkbox
4. Save Preferences

**Start MCP server in Blender:**
1. Press `N` in 3D viewport
2. BlenderMCP tab → "Start MCP Server"
3. Leave Blender running

**Claude Code config:**

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

### Verify

Restart Claude Code. `/mcp` should show `blender`. Ask me to create a red cube in Blender — cube should appear.

### What Claude needs from Ahmad

- [ ] Blender running with MCP server active before each art session
- [ ] Restart MCP server inside Blender if connection drops

---

## 6. ElevenLabs MCP — Phase 2

Skip for now. Install when you're ready to add real audio (likely month 3-4 of development).

### When you get there

1. Sign up at [elevenlabs.io](https://elevenlabs.io/)
2. API Keys → create key
3. Install: `uvx install elevenlabs-mcp`
4. Config:

```json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": {
        "ELEVENLABS_API_KEY": "your_key_here"
      }
    }
  }
}
```

Free tier needs attribution in credits. Paid ($5/mo) drops that.

---

## Master MCP config (start here)

Minimal config for the essential stack:

```json
{
  "mcpServers": {
    "roblox-studio": {
      "command": "path/to/roblox-studio-mcp",
      "args": []
    },
    "tripo": {
      "command": "uvx",
      "args": ["tripo-mcp"],
      "env": {
        "TRIPO_API_KEY": "your_key_here"
      }
    }
  }
}
```

Add `blender` entry only if validation test fails. Add `elevenlabs` entry during Phase 2.

---

## Folder structure (create in project)

```
the-oath-of-peace/
├── assets/
│   ├── audio/              (empty for now — Phase 2)
│   ├── textures/           (empty for now)
│   ├── models/
│   │   ├── generated/      (Tripo outputs land here)
│   │   └── final/          (Studio-ready assets)
│   └── reference/          (concept art, reference images)
├── src/                    (game code — TBD)
└── (existing docs)
```

---

## Session-start checklist

Every time we work:

- [ ] Roblox Studio open with active place
- [ ] Studio MCP plugin enabled
- [ ] Tripo API key still valid in config
- [ ] (If Blender installed) Blender open, MCP server running
- [ ] Claude Code running in the project folder

---

## Failure recovery

If an MCP doesn't show up after restart:

1. Validate JSON: paste into [jsonlint.com](https://jsonlint.com/)
2. Check paths are absolute and binaries exist
3. Claude Code logs: VS Code → Output panel → "Claude Code"
4. Run the MCP command manually in terminal to see errors
5. Restart VS Code completely

If Studio MCP disconnects:
- Close and reopen Studio
- Verify plugin is enabled

If Tripo fails:
- Check credit balance (free tier limits)
- Verify API key is valid
- Note: Tripo uses hosted generation, so downtime is on their side — wait and retry

---

## Cost at each stage

**Stage 1 (now — setup + validation):**
- Roblox Studio + MCP: $0
- Tripo MCP (uses your existing Tripo credits): $0
- Total: **$0**

**Stage 2 (if Blender needed):**
- Blender + MCP: $0
- Total: **$0**

**Stage 3 (production, months 3-6):**
- ElevenLabs free tier: $0 (with attribution)
- Or ElevenLabs paid: $5/mo
- Free PBR textures: $0
- Total: **$0-5/mo**

**Stage 4 (polish, months 9-12):**
- Suno or Epidemic Sound: $10-20/mo
- Maybe Tripo Pro: $20/mo if credits run out
- Maybe freelance animator: $100-300 one-time
- Total: **$30-50/mo peak**

**Zero-dollar MVP is the real target until we're shipping.**

# Dev tooling — how to iterate fast

Three workflows exist, each for a different slice of the dev loop.

| Workflow | When | Speed |
|---|---|---|
| **1. Studio + `rojo serve`** | UI and client logic changes | ~1 sec per iteration |
| **2. `pnpm publish:dev`** | Testing teleport, MemoryStore, DataStore, or multiplayer | ~20 sec per iteration |
| **3. Studio MCP plugin** | Lets Claude run Luau live in your Studio session | Not applicable (once-per-session setup) |

---

## 1. `rojo serve` + Studio plugin — fast iteration

Use this for UI and non-persistence work.

**One-time setup:**

1. Install the Rojo Studio plugin: https://create.roblox.com/store/asset/13916111004/Rojo.
2. Open any `.rbxlx` in Studio (e.g. `oath.rbxlx`).

**Per-session:**

```
pnpm build            # compile TS once
pnpm watch &          # keep TS building on changes
rojo serve            # start Rojo HTTP server
```

In Studio: **Plugins → Rojo → Connect**. Saves now stream into Studio automatically. Press **F5** to Play.

**Gotchas:**
- MemoryStoreService + TeleportService + DataStoreService **won't work the same in Studio** as on live Roblox. For those, use workflow #2.
- ProfileStore uses `.Mock` in Studio (see `PlayerDataService.ts`) so profiles are ephemeral per Studio session.

---

## 2. `pnpm publish:dev` — deploy to the private experience

Use this for testing teleport, MemoryStore, real persistence, or multi-player.

**One-time setup:**

1. Go to https://create.roblox.com/dashboard/credentials.
2. Click **Create API Key**.
3. Configure:
   - Name: *Oath dev publisher* (or whatever).
   - **Access Permissions** → select **universe-places.write** (also called "Place Management").
   - Add the Hub place (`93283527222699`) and Match place (`83002760593219`) to the allowed list.
   - IP allowlist: `0.0.0.0/0` for dev (tighten for production).
4. Copy the API key.
5. Find the Universe ID:
   - https://create.roblox.com/dashboard/creations → click **The Oath (dev)**.
   - URL contains `/creations/experience/<UNIVERSE_ID>`. Copy the number.
6. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
   Fill in `ROBLOX_OPEN_CLOUD_KEY` and `ROBLOX_UNIVERSE_ID`. `.env` is gitignored.

**Per-iteration:**

```
pnpm publish:dev      # builds + publishes BOTH Hub and Match
pnpm publish:hub      # just Hub
pnpm publish:match    # just Match
```

Each takes ~10–15 sec. Open the experience on Roblox and test.

---

## 3. Roblox Studio MCP plugin — Claude executes Luau live

Lets Claude run scripts inside your Studio session and read the Output panel directly. Highest-fidelity debugging loop.

**One-time setup:**

1. In Studio: **View → Toolbox → Creator Store** (or marketplace tab).
2. Search for **Roblox Studio MCP** (or the current name — check the `Roblox/studio-rust-mcp-server` GitHub README at the time you set this up for the canonical plugin link).
3. Install. It adds a small panel letting Studio connect to the MCP server running on your machine.
4. Keep Studio open with `oath.rbxlx` loaded during Claude sessions.

Once installed, Claude can use `mcp__Roblox_Studio__*` tools to run code, inspect state, read Output. This requires both:
- Studio running with the plugin connected, AND
- The MCP server in `.mcp.json` (already configured — points at `mcp.bat`).

---

## Quick reference

```
# First run, or after pulling new code
pnpm install
pnpm build

# Testing UI changes (fastest loop)
pnpm watch &
rojo serve
# then Play in Studio

# Testing teleport / MemoryStore / real persistence
pnpm publish:dev
# then play on https://www.roblox.com/games/93283527222699

# Tests (when set up)
# (jest infrastructure is in place, runner integration pending)
```

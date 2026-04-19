# How to test The Oath of Peace locally

Each vertical slice lives here with reproducible steps. When a flow works, check the box.

---

## Character Creator MVP

**What shipped:** First-time join → "The Oath of Peace" screen with a Confirm button → "Begin your Oath" modal → Deploy → placeholder Hub UI. Returning players skip the creator. Profile state is persisted through ProfileStore (mocked in Studio).

### Setup (one-time)

1. Open a terminal in the project folder.
2. Run:
   ```
   pnpm install
   pnpm build
   rojo build -o oath.rbxlx
   ```
3. Open `oath.rbxlx` in Roblox Studio. *(or skip the `.rbxlx` step and use `rojo serve` + the Rojo plugin — either works)*

### Test 1 — first-time join sees the creator

- [ ] In Studio, open the **Test tab** → **Start** dropdown → choose **"Local Server"** with at least 1 player (Start Server + Players).
- [ ] Once Player1's window is up, you should see a dark screen with **"THE OATH OF PEACE"** title and a **Confirm** button.
- [ ] Click **Confirm**.
- [ ] Modal **"Begin your Oath"** appears. Click **Deploy**.
- [ ] Screen swaps to **"Hub (placeholder)"**. ✓

### Test 2 — returning player skips the creator

- [ ] Stop the test (red Stop button).
- [ ] **Without closing Studio** (ProfileStore mock persists for the Studio session), start a Local Server again with the same player.
- [ ] Player1 should land **directly on the Hub placeholder** — no creator screen. ✓

### Test 3 — fresh profile shows creator again

- [ ] **Close the .rbxlx file entirely** (or restart Studio). This wipes the ProfileStore mock state.
- [ ] Reopen and Start Server + Players.
- [ ] Creator should reappear. ✓

### Test 4 — rate limit on the confirm remote

- [ ] Start Server + Players.
- [ ] In the Player1 client window, open the dev console (`F9`).
- [ ] Paste into the console input (client-side):
  ```lua
  local ReplicatedStorage = game:GetService("ReplicatedStorage")
  -- Flamework networking event names are hashed; this test is easier via the UI:
  -- click Confirm → Deploy → then repeatedly click Confirm before re-render.
  ```
  Simpler test: spam Deploy during the "Deploying…" state. Server should quietly ignore extra fires (rate limit is 0.5/s with burst of 2).
- [ ] Check Studio Output for no warnings about state corruption. ✓

### What to look for if it breaks

| Symptom | Likely cause |
|---|---|
| Blank screen forever, Output says `[CharacterCreator] profile load timeout` | ProfileStore mock init failed — restart Studio |
| Creator re-appears after clicking Deploy | `profileUpdated` event didn't fire — check Output for errors |
| "Profile session ended" kick immediately | Two servers fighting for the same profile — rare in Studio, restart |
| TypeScript error on build | Run `pnpm install` then `pnpm build` again. If still broken, check `node_modules/@rbxts/react` exists |

### What's NOT in this slice (by design)

- Real cosmetic customization (none — MVP is confirm-only)
- Real hub functionality (placeholder only)
- Party codes, lobby, matchmaking (later phases)
- Match teleport (later phase)
- Live DataStore persistence (Studio uses ProfileStore's `.Mock` — real DataStore on published places)

---

## How to skip Studio entirely (quick sanity check)

```
pnpm check
```

This runs format + lint + build. If that passes, the TypeScript is valid, Rojo project is valid, and all JSX compiles. It does NOT exercise runtime logic — Studio playtest is the only way to verify that.

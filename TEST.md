# How to test The Oath locally

Each vertical slice lives here with reproducible steps. When a flow works, check the box.

---

## Character Creator MVP

**What shipped:** First-time join → "The Oath" screen with a Confirm button → "Begin your Oath" modal → Deploy → placeholder Hub UI. Returning players skip the creator. Profile state is persisted through ProfileStore (mocked in Studio).

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
- [ ] Once Player1's window is up, you should see a dark screen with **"THE OATH"** title and a **Confirm** button.
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

---

## Party + Pre-Match + Match Teleport (Slice 2)

**What shipped:** Hub lobby with Create / Join party (6-char codes), 4-player slots, Ready toggle, pre-match loadout screen with class picks + request buttons + XP bonus badges + countdown, real `TeleportService.ReserveServer` + `TeleportAsync` flow to a private match server, match-server-side roster validation, End Match → teleport back to hub.

### Why this requires published playtest (not Studio)

MemoryStore + TeleportService + reserved servers behave differently in Studio than on the real platform. MemoryStore works in Studio but is ephemeral per Studio session; TeleportService simulates teleports in Studio but doesn't actually hop places. **For this slice, publishing to the private experience is mandatory.**

### First-time setup (one-time)

1. Publish hub place: `rojo build -o oath.rbxlx`, open in Studio, **File → Publish to Roblox** → choose the existing **The Oath (dev)** experience, **Update the start place** (Hub, `93283527222699`).
2. Publish match place: in Studio, **File → Open From Roblox** → pick the **Match** place under the same experience. Close the hub file first. With the match place open, **File → Publish to Roblox** as the Match place (`83002760593219`). Use the **same built `oath.rbxlx`** — both places share the codebase; PlaceId routing decides what runs.
3. Open https://create.roblox.com/dashboard/creations → The Oath (dev) → **Playability**: confirm **Friends** or **Private**.

**Every time** you make a code change that affects either place:
- `pnpm build`
- Re-publish hub AND match (both places, same rbxlx). I'll automate this with a script later (`scripts/publish.sh`) once Open Cloud is wired.

### Test 1 — solo party → teleport → match → back

- [ ] Open https://www.roblox.com/games/93283527222699 → Play.
- [ ] Character creator shows first (if you haven't completed it yet in this published environment). Confirm + Deploy → Hub.
- [ ] Click **Create Party**. A 6-char code appears.
- [ ] Click **Ready**. Everyone ready (just you) → pre-match loadout screen.
- [ ] Pick a class. Watch the countdown.
- [ ] At 0s, teleport happens. You land in **"MATCH IN PROGRESS — You are {ClassName}"**.
- [ ] Click **End Match → Hub**. You teleport back. ✓

### Test 2 — party code with a friend (or alt account)

- [ ] You: start on hub, click Create Party, note the 6-char code.
- [ ] Friend/alt: opens the same experience link, joins hub, clicks **Join** with your code.
- [ ] Both of you appear in the party panel. Both hit Ready.
- [ ] Pre-match screen: both pick classes. You can click **Request Medic** (etc.) — the other player sees a +15% XP badge on that class.
- [ ] Countdown → both teleport to the SAME match server. Both see their own class label.
- [ ] Click End Match on either client → that player returns to hub (a new hub server instance — that's fine). ✓

### Test 3 — exploit defense: can't join a match you're not in

- [ ] Hard to test without a real exploit. What we can verify:
  - Match server logs "You are not in this match roster" kick if someone teleports in with a mismatched UserId (only happens under exploitation).
  - Match server logs "Match roster not found" if the MemoryStore entry expired.
- [ ] Check Studio output / server console after a normal match for any unexpected warnings.

### What to look for if it breaks

| Symptom | Likely cause |
|---|---|
| "No party with that code on this server yet" when joining | Friend is on a different hub server instance. MemoryStore party reservation is sharded, but in-memory party state is per-server. For MVP, party joins only work on the same hub server. Cross-server party join lands with matchmaking (later slice). |
| Teleport fails, party reverts to "forming" | `ReserveServer` or `TeleportAsync` threw. Check Studio output / F9 console for the specific `[Matchmaking]` warning. |
| Match place shows "Joining match…" forever | MemoryStore match roster wasn't written, or match server failed to read it. Check F9 on match server. |
| Kicked on match place with "Missing match handoff data" | You somehow teleported without going through the matchmaker (e.g., direct Roblox join link on the match place). Expected. Go back via hub. |
| Ready button does nothing | Rate-limited. Wait a second. Or you're not the only one not ready — check other players. |

### What's NOT in this slice (by design)

- **Cross-server party joins** — if your friend is on hub server A and you try to join from hub server B, it fails. Solution is matchmaking (later slice) or Studio-like MessagingService rendezvous.
- Per-class XP application after match end (schema v2 migration is not yet written — match end just teleports back, no XP awarded yet).
- Real last-played class lookup (MVP falls back to "assault").
- Retry beyond 3 attempts on teleport.
- Mission selection / difficulty / seed passing.
- Actual combat, enemies, objectives.

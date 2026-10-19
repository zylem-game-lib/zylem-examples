# Zylem Examples

Example applications and playground for the [Zylem](https://github.com/zylem-game-lib/zylem) game framework.

Live demos: [https://zylem-examples.onrender.com/](https://zylem-examples.onrender.com/)

This repository replaces the older showcase that was pinned to `@zylem/game-lib@0.3.16`. It now ships the current demos suite plus the SpacetimeDB multiplayer server used by the multiplayer lobby example.

## Requirements

- Node >= 22.12.0
- pnpm >= 10.32.1
- A WebGPU-capable browser
- [SpacetimeDB CLI](https://spacetimedb.com/install) for multiplayer demos

## Quick start

```bash
pnpm install
pnpm dev
```

Vite serves the app on [http://localhost:3331](http://localhost:3331) by default.

### Multiplayer (optional)

```bash
pnpm server:start          # terminal A — SpacetimeDB on 127.0.0.1:3000
pnpm server:dev            # terminal B — build + publish local DBs
pnpm dev                   # terminal C — Vite client
```

Regenerate client bindings after schema changes:

```bash
pnpm server:generate:bindings
```

## Dependencies

Published `@zylem/*` packages:

- `@zylem/game-lib`
- `@zylem/editor`
- `@zylem/ui`
- `@zylem/shaders`
- `@zylem/assets`
- `@zylem/bridge` (direct for Vite/pnpm resolution; also used transitively by game-lib/editor)

Local engine iteration uses the polyrepo manager (`zw link`) against sibling checkouts under `zylem-projects/`.

## Scripts

| Script                  | Description                   |
| ----------------------- | ----------------------------- |
| `pnpm dev`              | Vite playground               |
| `pnpm build`            | Production SPA → `dist/`      |
| `pnpm test:e2e`         | Playwright e2e                |
| `pnpm screenshot:local` | Capture demo screenshots      |
| `pnpm server:start`     | Start SpacetimeDB             |
| `pnpm server:dev`       | Build + publish local modules |
| `pnpm render:build`     | Render static-site build      |

## Deploy (Render)

`render.yaml` defines a split deploy:

1. **zylem-spacetimedb-api** — Docker SpacetimeDB API (`server/render/Dockerfile.api`)
2. **zylem-examples** — static site from `dist/` with `VITE_STDB_URI` pointing at the API

Build command: `sh ./scripts/render-build.sh`

## Curated examples

The public catalog contains 30 examples in three sections. The numbered
fundamentals are lessons within Basic. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
for implementation decisions and verification status.

Select a demo to see its objective and controls. **R** or **Restart example**
recreates the demo, including local state and spawned entities. This common host
control keeps reset boilerplate out of the teaching examples. Keyboard shortcuts
are ignored while editing a text field. Gamepads use Zylem's normal input mapping.

### Game Demos

| Example | Focus | Source |
| --- | --- | --- |
| Zario 64 | Climb the 3D platform course and reach the golden goal. | [Code](src/demos/third-person-test/third-person-test.ts) |
| Zario | Run and jump to the finish flag. | [Code](src/demos/jumper-2d/jumper-2d.ts) |
| Escape Zylocity | Explore the asteroid field and survive. | [Code](src/demos/3d-asteroids/3d-asteroids.ts) |
| Zylem Invaders | Clear waves of attackers along a fixed flight lane. | [Code](src/demos/3d-space-invaders/3d-space-invaders.ts) |
| Zylem Strike | Find and shoot all five targets in the arena. | [Code](src/demos/fps/fps.ts) |
| Zylem Craft | Gather crystals and train a squad of five units. | [Code](src/demos/zylem-craft/zylem-craft.ts) |
| Zylem Tourismo | Drive through the checkpoints in order for three laps. | [Code](src/demos/zylem-tourismo/zylem-tourismo.ts) |

### Remakes

| Example | Focus | Source |
| --- | --- | --- |
| Pong | Two players race to three points. | [Code](src/demos/pong/pong.ts) |
| Breakout | Break every brick before running out of lives. | [Code](src/demos/breakout/breakout.ts) |
| Asteroids | Destroy all five asteroids without being hit. | [Code](src/demos/asteroids/asteroids.ts) |
| Robotron | Clear the arena with independent movement and aim. | [Code](src/demos/robotron/robotron.ts) |
| Joust | Flap above each rival to win the aerial duel. | [Code](src/demos/joust/joust.ts) |
| Flappy Bird | Fly through gaps and beat your score. | [Code](src/demos/flappy-bird/flappy-bird.ts) |
| Fake game | A tiny title, play and results flow. | [Code](src/demos/fake-game/fake-game.ts) |

### Basic

| Example | Focus | Source |
| --- | --- | --- |
| Entities | Compose visuals and collision into one entity. | [Code](src/demos/entities/entities.ts) |
| Stages | Create stages from small, reusable factories. | [Code](src/demos/stages/stages.ts) |
| Actions | Compose movement with sequence, parallel and repeatForever. | [Code](src/demos/actions/actions.ts) |
| Behaviors | Attach a boundary behavior and use its typed handle. | [Code](src/demos/behaviors/behaviors.ts) |
| Basic | 1. Create the default Zylem game. | [Code](src/demos/basic/basic.ts) |
| Input | 2. Inspect buttons, axes and pointer input. | [Code](src/demos/input/input.ts) |
| Stage Test | 3. Switch between stages with shader transitions. | [Code](src/demos/stage-test/stage-test.ts) |
| Vessel Test | 4. Group child entities and observe lifecycle callbacks. | [Code](src/demos/vessel-test/vessel-test.ts) |
| State/UI | 5. Bind state changes to UI owned by a vessel. | [Code](src/demos/state-ui/state-ui.ts) |
| Boxes | 6. Stack geometry and let collision resolve it. | [Code](src/demos/boxes/boxes.ts) |
| Basic Entities | 7. Compare primitive entity factories. | [Code](src/demos/basic-entities/basic-entities.ts) |
| Groups | 8. Group boxes and spheres with a vessel. | [Code](src/demos/groups/groups.ts) |
| Sprites | 9. Play animations from a sprite atlas. | [Code](src/demos/sprites/sprites.ts) |
| Actor | 10. Control an animated 3D actor. | [Code](src/demos/actor/actor.ts) |
| Sounds | 11. Play collision sounds and a looping song. | [Code](src/demos/sounds/sounds.ts) |
| Shaders | 12. Compare built-in and custom material shaders. | [Code](src/demos/shaders/shaders.ts) |

### Compatibility and teaching conventions

- Old URLs for renamed examples resolve to the curated entry. Other experiments
  remain accessible directly but do not appear in the sidebar.
- The two space games retain their models, effects and focused helper modules.
  The fundamentals isolate one API at a time.
- Use entity factories, `onSetup`/`onUpdate`, `runAction`, `use`, input presets
  and state subscriptions. Velocity helpers take units/second; action durations
  take milliseconds. Do not multiply velocity helpers by frame delta.
- `_shared/behavior.ts` and `_shared/camera.ts` contain compatibility adapters for
  the published behavior/camera declarations, which still reference older entity
  interfaces. The demos attach through public game-lib APIs.
- A small pnpm patch guards empty Slider callback arrays in `@zylem/ui@0.9.3`;
  this lets the shipped TSX pass this repo's `noUncheckedIndexedAccess` setting.

### Validation

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm test:catalog
corepack pnpm build
corepack pnpm exec playwright install chromium
corepack pnpm test:e2e --project=chromium
```

The browser suite needs a working browser/GPU environment and access to the
asset CDN. It covers each curated route, restart, legacy aliases, navigation
and editor integration. See the plan for checks actually run for this migration.

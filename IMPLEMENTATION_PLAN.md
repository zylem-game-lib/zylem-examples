# Zylem examples refresh

This is the working checklist for the editor upgrade and the example catalog.
Keep it current as implementation and validation progress.

## Goals and decisions

- Upgrade to the latest **published** editor, with compatible engine, bridge,
  behavior and UI packages. Record the resolved versions in the lockfile.
- Publish exactly three catalog sections: Game Demos, Remakes and Basic.
- Include both the four fundamentals and the twelve numbered lessons in Basic.
  Entities introduces composition; Basic Entities is the geometry gallery.
- Treat “Fake game” as a deliberately small title → play → results example.
- Preserve existing assets and experimental demos. Old routes remain reachable;
  experiments no longer appear in the curated catalog.
- Prefer Zylem factories, lifecycle hooks, input presets, actions, behavior
  handles, stage factories and state subscriptions over custom infrastructure.
- Keep one concept per lesson. Use descriptive names, inferred types, local
  state and small functions. Avoid `any`, private engine internals and direct
  physics access in new examples. Keep richer game art in focused helpers.
- Every game needs visible controls, an objective, and a repeatable play loop.

## Baseline

- Repository base: `9844fd0` on `main`.
- Manifest starts at editor/game-lib/bridge `^0.9.4`, behaviors `^0.5.8`,
  UI `^0.8.13`.
- Published versions checked during implementation: editor `0.9.9`, game-lib
  `0.9.6`, bridge `0.9.6`, behaviors `0.8.11`, UI `0.9.3`.
- Existing catalog auto-discovers experiments and silently places them in Misc.
  Replace this with an explicit catalog, with a separate legacy route lookup.

## Work order

- [x] Inspect repository structure and published dependency versions.
- [x] Record baseline typecheck/build and any pre-existing failures.
- [x] Upgrade compatible Zylem packages and regenerate the pnpm lockfile.
- [x] Replace catalog, retain legacy routes, document controls and source paths.
- [x] Implement/refine the Basic lessons below.
- [x] Implement/refine the Remakes below.
- [x] Implement/refine the Game Demos below.
- [x] Typecheck and production build all source, including retained experiments.
- [ ] Check catalog/navigation/editor and smoke-test all curated routes.
- [ ] Exercise representative movement, score, restart and stage transitions.
- [ ] Review diff, update this checklist and open a pull request.

Checked example entries below mean implementation and control documentation are
complete. Browser rendering, editor integration and gameplay remain unverified
for all 30 entries; see the validation record at the end.

## Game Demos

- [x] **Zario 64** — 3D platformer; typed platformer behavior, actor animation,
  third-person camera, collectible/goal and recovery after a fall.
- [x] **Zario** — 2D platformer; sprite animation, platformer behavior, follow
  camera, finish trigger and restart.
- [x] **Escape Zylocity** — free-roaming top-down space shooter; retain ship
  art, use Zylem actions/behaviors for firing and lifecycle, follow the ship.
- [x] **Zylem Invaders** — on-rails space shooter; retain enemy patterns/art,
  simplify firing/lifetime handling and keep wave progression.
- [x] **Zylem Strike** — FPS; first-person/jump coordination, target shooting,
  score and reset.
- [x] **Zylem Craft** — RTS; unit selection, movement orders, gathering and
  production in a compact playable scenario.
- [x] **Zylem Tourismo** — racing; steering, acceleration, ordered checkpoints,
  laps and restart.

## Remakes

- [x] **Pong** — boundary/ricochet behaviors, two players, first-to-three/reset.
- [x] **Breakout** — paddle, ricochet, bricks, lives, win/lose/reset.
- [x] **Asteroids** — thrust, wrap, shooting, score/win/lose/reset.
- [x] **Robotron** — twin-stick movement/aim, enemies, lives and reset.
- [x] **Joust** — flap, wrap, height-based combat, score/win/lose/reset.
- [x] **Flappy Bird** — flap, scrolling gaps, scoring, failure/reset.
- [x] **Fake game** — title, play and results stages, intentionally tiny loop.

## Basic — Zylem fundamentals

- [x] **Entities** — compose an entity from visual and collision components.
- [x] **Stages** — stage factories and forward/back navigation.
- [x] **Actions** — readable sequence, parallel and repeat composition.
- [x] **Behaviors** — attach/use a behavior through its typed handle.
- [x] **1. Basic** — create the default Zylem game.
- [x] **2. Input** — inspect buttons, axes and pointer input.
- [x] **3. Stage Test** — multiple stages within the default game.
- [x] **4. Vessel Test** — vessel setup/update/destroy lifecycle.
- [x] **5. State/UI** — reactive UI and vessel container/state ownership.
- [x] **6. Boxes** — geometry with collision.
- [x] **7. Basic Entities** — Box, Sphere and other primitive factories.
- [x] **8. Groups** — vessel-owned boxes/spheres with synchronized child actions.
- [x] **9. Sprites** — sprite sheet and animation.
- [x] **10. Actor** — controllable animated actor.
- [x] **11. Sounds** — collision sound and user-started looping music.
- [x] **12. Shaders** — built-in and custom material shaders.

## Validation and completion criteria

Use the repository's pinned pnpm via `corepack pnpm`. Run typecheck and build;
add targeted catalog/route coverage because this migration changes discovery.
Use browser checks for module loading, editor integration and gameplay. Report
WebGPU/browser/environment limitations explicitly instead of marking untested
interactions as verified. A catalog entry is complete only when its source is
implemented, controls documented and its verification status recorded below.

## Implementation notes / verification results

### Completed implementation

- Resolved editor `0.9.9`, game-lib/bridge `0.9.6`, behaviors `0.8.11` and
  UI `0.9.3`; kept the repository's pinned pnpm and Three.js version.
- Added an explicit 30-entry catalog, source links, objectives, controls and
  canonical routes. Retained old aliases and experimental source/routes.
- Added a shared restart button / R shortcut, stale-load protection and visible
  loading errors. Restart recreates each demo factory and its local state.
- Replaced repeated input, animation, action and behavior boilerplate with
  public Zylem APIs and a few focused helpers. Kept existing game assets.
- Added all missing remakes, game scenarios and fundamentals. RTS gathering and
  projectile/debris expiry use actions; platformers use platformer behaviors;
  stage/state/vessel lessons each illustrate one feature.
- Isolated two published declaration mismatches in `_shared/behavior.ts` and
  `_shared/camera.ts` instead of scattering casts through examples.
- Added a narrow pnpm patch for UI 0.9.3's Slider: ignore an absent first value
  before invoking its numeric callback. This keeps strict indexed-access checks.
- Fixed pre-existing version logging and legacy multiplayer type imports so the
  full source tree typechecks. Added typecheck and catalog tests to CI.

### Validation record

| Check | Result |
| --- | --- |
| Baseline production build | Passed before changes |
| Baseline typecheck | Failed on incompatible behavior/camera types, old multiplayer imports, version logging and UI Slider indexed access |
| `corepack pnpm install --frozen-lockfile` | Passed with the updated lockfile and UI patch |
| `corepack pnpm typecheck` | Passed across the full source tree |
| `corepack pnpm test:catalog` | Passed: exact catalog/order, unique routes, source existence and control/objective documentation |
| `corepack pnpm build` | Passed; existing large-chunk and browser-external warnings remain |
| Playwright Chromium test discovery | Passed: 41 tests in four files |
| Browser rendering/editor/gameplay | Blocked: installed Chromium exits with `socket() failed: Operation not permitted` before page launch |

The new browser suite covers startup and factory restart for all 30 routes,
legacy aliases and the three-section sidebar. These tests have been discovered
but **have not been executed successfully**. Existing editor/mobile tests are
retained, with renamed Basic routes updated.

### Remaining before merge

- [ ] Run the Chromium suite on a machine that permits browser sockets and
  supports the renderer: `corepack pnpm exec playwright test --project=chromium`.
- [ ] Check editor open/close, route changes, loading errors and restart cleanup.
- [ ] Play all seven Game Demos and seven Remakes through scoring, loss/win and
  restart; check camera behavior and assets for the 3D demos.
- [ ] Exercise movement, input mappings, stage transitions, vessel destruction,
  state subscriptions, sprite/actor animation, collision audio and shaders.
- [ ] Review mobile navigation and the controls overlay at narrow widths.

Publication status: implementation is ready for a draft PR; gameplay review is
an explicit remaining gate, not a passing validation claim.

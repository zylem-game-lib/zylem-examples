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
- [ ] Record baseline typecheck/build and any pre-existing failures.
- [ ] Upgrade compatible Zylem packages and regenerate the pnpm lockfile.
- [ ] Replace catalog, retain legacy routes, document controls and source paths.
- [ ] Implement/refine the Basic lessons below.
- [ ] Implement/refine the Remakes below.
- [ ] Implement/refine the Game Demos below.
- [ ] Typecheck and production build all source, including retained experiments.
- [ ] Check catalog/navigation/editor and smoke-test all curated routes.
- [ ] Exercise representative movement, score, restart and stage transitions.
- [ ] Review diff, update this checklist and open a pull request.

## Game Demos

- [ ] **Zario 64** — 3D platformer; typed platformer behavior, actor animation,
  third-person camera, collectible/goal and recovery after a fall.
- [ ] **Zario** — 2D platformer; sprite animation, platformer behavior, follow
  camera, finish trigger and restart.
- [ ] **Escape Zylocity** — free-roaming top-down space shooter; retain ship
  art, use Zylem actions/behaviors for firing and lifecycle, follow the ship.
- [ ] **Zylem Invaders** — on-rails space shooter; retain enemy patterns/art,
  simplify firing/lifetime handling and keep wave progression.
- [ ] **Zylem Strike** — FPS; first-person/jump coordination, target shooting,
  score and reset.
- [ ] **Zylem Craft** — RTS; unit selection, movement orders, gathering and
  production in a compact playable scenario.
- [ ] **Zylem Tourismo** — racing; steering, acceleration, ordered checkpoints,
  laps and restart.

## Remakes

- [ ] **Pong** — boundary/ricochet behaviors, two players, first-to-three/reset.
- [ ] **Breakout** — paddle, ricochet, bricks, lives, win/lose/reset.
- [ ] **Asteroids** — thrust, wrap, shooting, score/win/lose/reset.
- [ ] **Robotron** — twin-stick movement/aim, enemies, lives and reset.
- [ ] **Joust** — flap, wrap, height-based combat, score/win/lose/reset.
- [ ] **Flappy Bird** — flap, scrolling gaps, scoring, failure/reset.
- [ ] **Fake game** — title, play and results stages, intentionally tiny loop.

## Basic — Zylem fundamentals

- [ ] **Entities** — compose an entity from visual and collision components.
- [ ] **Stages** — stage factories and forward/back navigation.
- [ ] **Actions** — readable sequence, parallel and repeat composition.
- [ ] **Behaviors** — attach/use a behavior through its typed handle.
- [ ] **1. Basic** — create the default Zylem game.
- [ ] **2. Input** — inspect buttons, axes and pointer input.
- [ ] **3. Stage Test** — multiple stages within the default game.
- [ ] **4. Vessel Test** — vessel setup/update/destroy lifecycle.
- [ ] **5. State/UI** — reactive UI and vessel container/state ownership.
- [ ] **6. Boxes** — geometry with collision.
- [ ] **7. Basic Entities** — Box, Sphere and other primitive factories.
- [ ] **8. Groups** — groups of boxes/spheres with shared transforms.
- [ ] **9. Sprites** — sprite sheet and animation.
- [ ] **10. Actor** — controllable animated actor.
- [ ] **11. Sounds** — collision sound and user-started looping music.
- [ ] **12. Shaders** — built-in and custom material shaders.

## Validation and completion criteria

Use the repository's pinned pnpm via `corepack pnpm`. Run typecheck and build;
add targeted catalog/route coverage because this migration changes discovery.
Use browser checks for module loading, editor integration and gameplay. Report
WebGPU/browser/environment limitations explicitly instead of marking untested
interactions as verified. A catalog entry is complete only when its source is
implemented, controls documented and its verification status recorded below.

## Implementation notes / verification results

To be updated during the work.

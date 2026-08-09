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

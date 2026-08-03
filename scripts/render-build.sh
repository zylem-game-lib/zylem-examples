#!/usr/bin/env sh

set -eu

_root_dir="$(cd "$(dirname "$0")/.." && pwd)"

cd "${_root_dir}"

if command -v pnpm >/dev/null 2>&1; then
  echo "pnpm already available: $(pnpm --version)"
else
  corepack enable
  corepack prepare --activate
fi
pnpm install --frozen-lockfile
export NODE_ENV=production

# The wasm runtime comes prebuilt from the @zylem/runtime npm package
# (via @zylem/game-lib), so no Rust toolchain is needed here.
pnpm run build

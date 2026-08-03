#!/usr/bin/env sh
# Resolve SpacetimeDB CLI: SPACETIME_CLI, repo-local .tools install, or PATH.
# On CI (Render native Node sets CI=true), installs toolchain via repo scripts/ensure-spacetimedb-toolchain-ci.sh.
# POSIX sh so `pnpm run` does not require `bash` on PATH (e.g. some CI images).
set -eu
_pkg_root="$(cd "$(dirname "$0")/.." && pwd)"
_repo_root="$(cd "${_pkg_root}/.." && pwd)"
_repo_local_root="${_repo_root}/.tools/spacetimedb"
_default_cli="${_repo_local_root}/bin/current/spacetimedb-cli"
_ensure="${_repo_root}/scripts/ensure-spacetimedb-toolchain-ci.sh"

# Repo-vendored .tools binaries may be macOS-only; skip them on Linux (Render).
_repo_cli_is_native() {
  _bin="$1"
  [ -x "${_bin}" ] || return 1
  case "$(uname -s 2>/dev/null || echo unknown)" in
    Linux)
      # ELF magic: 0x7f 'E' 'L' 'F'
      _magic="$(dd if="${_bin}" bs=4 count=1 2>/dev/null || true)"
      [ "${_magic}" = "$(printf '\177ELF')" ]
      ;;
    *)
      return 0
      ;;
  esac
}

if [ -x "${_repo_local_root}/spacetime" ] && _repo_cli_is_native "${_default_cli}"; then
  export PATH="${_repo_local_root}:${PATH}"
fi

if [ -n "${SPACETIME_CLI:-}" ] && [ -x "${SPACETIME_CLI}" ]; then
  exec "${SPACETIME_CLI}" "$@"
elif _repo_cli_is_native "${_default_cli}"; then
  exec "${_default_cli}" "$@"
elif command -v spacetime >/dev/null 2>&1; then
  exec spacetime "$@"
elif command -v spacetimedb-cli >/dev/null 2>&1; then
  exec spacetimedb-cli "$@"
elif [ "${CI:-}" = "true" ] || [ "${RENDER:-}" = "true" ] || [ "${SPACETIME_AUTO_INSTALL_TOOLCHAIN:-}" = "1" ]; then
  sh "${_ensure}"
  export PATH="${HOME}/.local/bin:${HOME}/.spacetimedb:${HOME}/.spacetimedb/bin/current:${HOME}/.local/share/spacetime/bin/current:${PATH}"
  export PATH="${HOME}/.cargo/bin:${PATH}"
  if [ -n "${SPACETIME_CLI:-}" ] && [ -x "${SPACETIME_CLI}" ]; then
    exec "${SPACETIME_CLI}" "$@"
  elif command -v spacetime >/dev/null 2>&1; then
    exec spacetime "$@"
  elif command -v spacetimedb-cli >/dev/null 2>&1; then
    exec spacetimedb-cli "$@"
  elif [ -x "${HOME}/.local/share/spacetime/bin/current/spacetimedb-cli" ]; then
    exec "${HOME}/.local/share/spacetime/bin/current/spacetimedb-cli" "$@"
  elif [ -x "${HOME}/.spacetimedb/bin/current/spacetimedb-cli" ]; then
    exec "${HOME}/.spacetimedb/bin/current/spacetimedb-cli" "$@"
  fi
  echo "SpacetimeDB CLI not found after CI toolchain install. See README.md" >&2
  exit 127
else
  echo "SpacetimeDB CLI not found. Install: https://spacetimedb.com/install" >&2
  echo "Or set SPACETIME_CLI, or install to repo .tools/spacetimedb (see README.md)." >&2
  exit 127
fi

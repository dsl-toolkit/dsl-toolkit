#!/usr/bin/env bash
#
# GitHub sync bootstrap for this monorepo.
#
# The sync logic lives in the user's bash.sh framework (~/bash.sh) as shell
# functions. This script is the bridge: it loads that framework in a
# NON-interactive shell (which .bashrc deliberately refuses to do) and then
# calls the function. If the framework - or the function - is not reachable,
# it errors out loudly instead of silently doing nothing.
#
# Usage:
#   scripts/github-sync.sh          # real sync (needs GITHUB_TOKEN)
#   scripts/github-sync.sh true     # dry run (no credential needed)
#
# Exit codes: 0 success, 1 any precondition failure or sync failure.

# Error handling.
#
# Deliberately NO `set -u`: rc.sh is written in non-strict style and expands
# unset variables freely, so nounset makes the sourced framework terminate the
# shell instantly (verified: `set -u` before `source rc.sh` kills it, while
# -e and pipefail are harmless). rc.sh also manages its own shell state - it
# does `set +x` / `set +e` on entry - so it is not written to be sourced under
# strict mode. Keep pipefail for our own command substitutions; plain `source`
# does not report failures through the pipe status, so -e stays safe there.
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
YAML_FILE="$REPO_ROOT/.github-sync.yaml"
RC_FILE="${BASH_SH_RC:-${HOME:-/root}/bash.sh/rc.sh}"

DRY_RUN="${1:-false}"

# --- function that must exist after rc.sh loads -------------------------
# Emits one name per line so the loop below stays simple.
required_functions() {
  printf '%s\n' github_sync_workflow yaml_scanner extract-git-path github_pusher
}

die() {
  printf 'github-sync: ERROR: %s\n' "$*" >&2
  exit 1
}

# --- precondition 1: framework present ----------------------------------
[[ -f "$RC_FILE" ]] ||
  die "bash.sh framework not found at '$RC_FILE'.
       This command is an inside job: it only runs on a machine where bash.sh
       is installed. Override the location with BASH_SH_RC=/path/to/rc.sh."

# --- precondition 2: config present -------------------------------------
[[ -f "$YAML_FILE" ]] ||
  die "sync config not found at '$YAML_FILE'."

# --- load the framework (non-interactive) -------------------------------
# rc.sh prints banners/timings and chatters on stderr; keep the happy path
# quiet, but preserve the log so failures are diagnosable.
RC_LOG="$(mktemp "${TMPDIR:-/tmp}/github-sync-rc.XXXXXX")"
# shellcheck disable=SC2064
trap "rm -f '$RC_LOG'" EXIT

echo "github-sync: loading bash.sh framework..." >&2

# shellcheck source=/dev/null
if ! source "$RC_FILE" >"$RC_LOG" 2>&1; then
  printf 'github-sync: ERROR: sourcing %s failed. Last lines:\n' "$RC_FILE" >&2
  tail -n 15 "$RC_LOG" >&2
  exit 1
fi

# --- precondition 3: the function is actually reachable -----------------
# Guards against the lazy-loader defining stubs while the backing file is
# gone, and against bash.sh being refactored out from under this script.
missing=()
while IFS= read -r fn; do
  declare -F "$fn" >/dev/null 2>&1 || missing+=("$fn")
done < <(required_functions)

if ((${#missing[@]})); then
  printf 'github-sync: ERROR: %s loaded but these functions are undefined: %s\n' \
    "$RC_FILE" "${missing[*]}" >&2
  printf '             bash.sh was found, so this is a framework problem (stub\n' >&2
  printf '             without a backing file, or the function was renamed).\n' >&2
  exit 1
fi

# --- run ----------------------------------------------------------------
# The scanner resolves project paths relative to the YAML file, but the
# workflow defaults to a relative './.github-sync.yaml', so cwd matters.
cd "$REPO_ROOT" || die "cannot cd to '$REPO_ROOT'"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "github-sync: DRY RUN (no repositories will be created or pushed)" >&2
fi

github_sync_workflow "$YAML_FILE" "$DRY_RUN"
status=$?

if ((status != 0)); then
  echo "github-sync: FAILED (exit $status)" >&2
  exit "$status"
fi

echo "github-sync: done" >&2

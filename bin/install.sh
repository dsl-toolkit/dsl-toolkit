#!/usr/bin/env bash

SCRIPT_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)

install-dslf(){
  PROJECT_ROOT="$(realpath "${SCRIPT_DIR}"/../)"
  NODE_MODULES=$(realpath "$PROJECT_ROOT"/node_modules)
  echo -- "$PROJECT_ROOT" -- "$NODE_MODULES" -- "$SCRIPT_DIR"
  cd "$PROJECT_ROOT" || exit
  ls -lah
  [[ -d $NODE_MODULES ]] || npm install && npm run test-clean && node_modules/.bin/lerna bootstrap
}

install-dslf

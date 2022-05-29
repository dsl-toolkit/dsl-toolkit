#!/usr/bin/env bash

SCRIPT_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)

install-dslf(){
  PROJECT_ROOT="$(realpath "${SCRIPT_DIR}"/../)"
  NODE_MODULES=$(realpath "$PROJECT_ROOT"/node_modules)
  [[ -d $NODE_MODULES ]] || npm install
}; install-dslf

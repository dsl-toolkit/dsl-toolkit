#!/usr/bin/env bash

SCRIPT_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)

PROJECT_ROOT=$(realpath $SCRIPT_DIR/../)
NODE_MODULES=$(realpath $PROJECT_ROOT/node_modules)
echo -- $PROJECT_ROOT -- $NODE_MODULES -- $SCRIPT_DIR
cd $PROJECT_ROOT
if [[ -f "$NODE_MODULES" ]]; then
    npm install && npm run test-clean
fi
npm run build-src

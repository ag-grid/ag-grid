#!/bin/bash

set -eu

fw=vue3
fw_package=vue
dev_port=5173

function install_fw {
    echo ">>> npx create-vue"
    npx create-vue --default --ts vue-${version}-test

    cd vue-${version}-test
    npm i vite-plugin-vue-devtools@7.7.2 # Workaround for https://github.com/vuejs/devtools/issues/861
    npm i
}

function build_fw {
    echo ">>> npm run build"
    npm run build
}

function serve_fw {
    echo ">>> npm run dev"
    npm run dev --host
}

function patch_fw {
    echo ">>> vue css patch"
    cp $patch_dir/assets/* src/assets/
}

# NOTE: This gets inlined when running in Docker for simplicity of execution.
source $(readlink -f $(dirname $0))/../shared/run.sh

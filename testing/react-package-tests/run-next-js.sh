#!/bin/bash

set -eu

fw=react
dev_port=3000
patch_subdir=next-js

function install_fw {
    npx -y create-next-app@latest react-${version}-next-js-test --yes --ts --src-dir --app

    cd react-${version}-next-js-test
    npm i react@${version} react-dom@${version}
}

function build_fw {
    echo ">>> npm run build"
    npm run build
}

function serve_fw {
    echo ">>> npm run dev"
    npm run dev
}

function patch_fw {
    echo ">>> nextjs css patch - noop"
}

# NOTE: This gets inlined when running in Docker for simplicity of execution.
source $(readlink -f $(dirname $0))/../shared/run.sh

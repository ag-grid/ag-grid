#!/bin/bash

set -eu

fw=react
fw_package=react
dev_port=5173
patch_subdir=basic

function install_fw {
    npm create -y vite@latest react-${version}-basic-test -- --template react-ts

    cd react-${version}-basic-test
    npm i react@${version} react-dom@${version}
    npm i

#    git init
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
    echo ">>> basic react css patch - noop"
}

# NOTE: This gets inlined when running in Docker for simplicity of execution.
source $(readlink -f $(dirname $0))/../shared/run.sh

#!/bin/bash

set -eu

fw=angular
fw_package="@angular/cli"
dev_port=4200

function install_fw {
    if [[ ${version} == "latest" ]] ; then
        echo ">>> npm i -g @angular/cli@latest"
        npm i -g @angular/cli@latest --cache ${cache_location}
    else
        echo ">>> npm i -g @angular/cli@^${version}.0.0"
        npm i -g @angular/cli@^${version}.0.0 --cache ${cache_location}
    fi
    echo ">>> ng new angular-${version}-test"
    echo "" | ng new angular-${version}-test --defaults=true --strict --prefix=app --style=scss --package-manager=npm --routing=false --interactive=false --no-strict --skip-git

    cd angular-${version}-test

    # look for the file called src/app/app.html and rename it to src/app/app.component.html
    # From Angular v20 the suffix .component is not added by default
    if [ -f src/app/app.html ]; then
        mv src/app/app.html src/app/app.component.html
        sed -i '' "s/import { App } from '\.\/app\/app';/import { App } from '\.\/app\/app.component';/" src/main.ts
    fi
    if [ -f src/app/app.ts ]; then
        mv src/app/app.ts src/app/app.component.ts
        sed -i '' "s/templateUrl: '.\/app.html',/templateUrl: '.\/app.component.html',/" src/app/app.component.ts
    fi
}

function build_fw {
    echo ">>> ng build"
    ng build
}

function serve_fw {
    echo ">>> ng serve"
    ng serve --host 0.0.0.0 &
}

function patch_fw {
    echo ">>> angular css patch - noop"
}

# NOTE: This gets inlined when running in Docker for simplicity of execution.
source $(readlink -f $(dirname $0))/../shared/run.sh

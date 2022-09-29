#!/bin/bash

set -eu

LOCAL_REPO_ROOT=$(git rev-parse --show-toplevel)
BASE_PATH=/workspace/ag-grid
CHARTS_PATH=${BASE_PATH}/charts-packages/ag-charts-community
NODE_MODULES_PATH=${CHARTS_PATH}/node_modules
DOCKER_TTY_ARGS=$(if [ -t 1 ] ; then echo "-t" ; else echo "" ; fi)

case $1 in
    init)
        docker run -i ${DOCKER_TTY_ARGS} \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            charts:latest \
            npm i --no-package-lock
    ;;

    run)
        shift 1
        docker run -i ${DOCKER_TTY_ARGS} \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v ${LOCAL_REPO_ROOT}/charts-packages/ag-charts-community:${CHARTS_PATH} \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            charts:latest \
            $@
    ;;

    *)
        echo "Unknown command $1"
    ;;
esac

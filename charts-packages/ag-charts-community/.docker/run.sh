#!/bin/bash

set -eu

LOCAL_REPO_ROOT=$(git rev-parse --show-toplevel)
BASE_PATH=/workspace/ag-grid
CHARTS_PATH=${BASE_PATH}/charts-packages/ag-charts-community
NODE_MODULES_PATH=${CHARTS_PATH}/node_modules

case $1 in
    init)
        docker run -it \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            charts:latest \
            npm i --no-package-lock
    ;;

    run)
        shift 1
        docker run -it \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v ${LOCAL_REPO_ROOT}/charts-packages/ag-charts-community:${CHARTS_PATH} \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            charts:latest \
            $@
    ;;

    clean)
        docker volume rm charts-nm
        docker image rm charts:latest
        docker system prune -y
    ;;

    *)
        echo "Unknown command $1"
    ;;
esac

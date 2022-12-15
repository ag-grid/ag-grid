#!/bin/bash

set -eu

LOCAL_REPO_ROOT=$(git rev-parse --show-toplevel)
BASE_PATH=/workspace/ag-grid
CHARTS_PATH=${BASE_PATH}/charts-packages/ag-charts-community
NODE_MODULES_PATH=${CHARTS_PATH}/node_modules

case $1 in
    init)
        docker run --rm -it \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            charts:latest \
            npm i --no-package-lock
    ;;

    run)
        shift 1
        docker run --rm -it \
            -v ${LOCAL_REPO_ROOT}:${BASE_PATH}:ro \
            -v ${LOCAL_REPO_ROOT}/charts-packages/ag-charts-community:${CHARTS_PATH} \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${CHARTS_PATH} \
            -p 3000:3000 \
            -p 9229:9229 \
            charts:latest \
            $@
    ;;

    clean)
        if ((docker volume ls | grep charts-nm) 2>/dev/null >/dev/null) ; then
            docker volume rm charts-nm
        fi
        if (docker image ls | grep charts:latest 2>/dev/null >/dev/null) ; then
            docker image rm charts:latest
        fi
        docker system prune -f
    ;;

    *)
        echo "Unknown command $1"
    ;;
esac

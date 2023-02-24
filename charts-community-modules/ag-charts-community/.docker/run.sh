#!/bin/bash

set -eu

LOCAL_REPO_ROOT=$(git rev-parse --show-toplevel)
MODULE_PATH=$(git rev-parse --show-prefix)
DOCKER_REPO_ROOT=/workspace/ag-grid
DOCKER_MODULE_PATH=${DOCKER_REPO_ROOT}/${MODULE_PATH}
NODE_MODULES_PATH=${DOCKER_MODULE_PATH}/node_modules

case $1 in
    init)
        docker run --rm -it \
            -v ${LOCAL_REPO_ROOT}:${DOCKER_REPO_ROOT}:ro \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${DOCKER_MODULE_PATH} \
            charts:latest \
            npm i --no-package-lock
    ;;

    run)
        shift 1
        docker run --rm -it \
            -v ${LOCAL_REPO_ROOT}:${DOCKER_REPO_ROOT}:ro \
            -v ${LOCAL_REPO_ROOT}/${MODULE_PATH}:${DOCKER_MODULE_PATH} \
            -v charts-nm:${NODE_MODULES_PATH} \
            -w ${DOCKER_MODULE_PATH} \
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

#!/bin/bash

set -u

SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
PROJECTS=""

if [[ $(basename $(pwd)) == "ag-charts-enterprise" ]] ; then
  FONTDIR=$PWD/src/test
else
  FONTDIR=$PWD/src/chart/test
fi

function testDev {
    npm run test:lint
    export FC_DEBUG=0
    export FONTCONFIG_PATH=$FONTDIR
    export FONTCONFIG_FILE=$FONTDIR/fonts.conf
    export PANGOCAIRO_BACKEND=fontconfig
    npx jest ${PROJECTS} --detectOpenHandles ${1:-}
}

function testCI {
    export FC_DEBUG=0
    export FONTCONFIG_PATH=$FONTDIR
    export FONTCONFIG_FILE=$FONTDIR/fonts.conf
    export PANGOCAIRO_BACKEND=fontconfig
    npx jest --runInBand
}

if [[ "$OSTYPE" != "linux-gnu"* ]] ; then
    echo -e "\033[41m\033[30mLinux is the only supported execution environment for Charts e2e tests.\033[0m"
    PROJECTS="--selectProjects unit"
fi

if [[ "${TEAMCITY_PROJECT_NAME:-}" == "" ]] ; then
  case ${1:-} in
    watch)
      testDev --watch
    ;;

    coverage)
      testDev --coverage
    ;;

    update)
      export SNAPSHOT_FAILURE_THRESHOLD=0.001
      testDev -u
    ;;

    *)
      testDev
    ;;
  esac
else
  testCI
fi

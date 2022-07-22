#!/bin/sh

set -eu

# AG_HOOK_MODE can be one of:
# - 'off' - do nothing.
# - 'verify' - perform requested verification type.
# - 'fix' - attempt to autofix verification failures.
MODE=${AG_HOOK_MODE:-verify}

TYPE=${1}
shift

if [ "$MODE" == "off" ] ; then
    exit 0
fi

case $TYPE in
  prettier)
    if [ "$MODE" == "verify" ] ; then
        exec npx prettier --list-different "$@"
    elif [ "$MODE" == "fix" ] ; then
        exec npx prettier -w "$@"
    fi
  ;;

  autodocs)
    if [ "$MODE" == "verify" ] ; then
        exec npx lerna run --scope @ag-grid-community/all-modules generate-doc-files -- -- --check
    elif [ "$MODE" == "fix" ] ; then
        exec npx lerna run --scope @ag-grid-community/all-modules generate-doc-files
    fi
  ;;

  *)
    echo "Unknown type of verification: ${TYPE}" >&2
    exit 5
  ;;
esac

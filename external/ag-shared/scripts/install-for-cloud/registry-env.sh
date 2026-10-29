# shellcheck shell=bash
# external/ag-shared/scripts/install-for-cloud/registry-env.sh
#
# Sourced (not run) by the scripts in this directory that call `yarn install`,
# after they set REPO_ROOT.
#
# ag-grid and ag-studio pin AG packages to betas that only registry.ag-grid.com
# serves, and their `npm run bootstrap` sets YARN_NPM_REGISTRY_SERVER for the
# install. A plain `yarn install` asks the public registry instead and 404s on
# those pins, so take the registry from the repo's own bootstrap script. ag-charts
# sets none there and keeps Yarn's default. Parsed with sed rather than node
# because cloud-setup.sh sources this before node is on PATH.

if [[ -z "${YARN_NPM_REGISTRY_SERVER:-}" && -f "$REPO_ROOT/package.json" ]]; then
    ag_bootstrap_registry=$(sed -n 's/.*"bootstrap":.*YARN_NPM_REGISTRY_SERVER=\\"\([^"\\]*\)\\".*/\1/p' "$REPO_ROOT/package.json")
    if [[ -n "$ag_bootstrap_registry" ]]; then
        export YARN_NPM_REGISTRY_SERVER="$ag_bootstrap_registry"
    fi
    unset ag_bootstrap_registry
fi

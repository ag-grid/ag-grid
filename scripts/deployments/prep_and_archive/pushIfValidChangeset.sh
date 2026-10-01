#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply a release version and release branch"
    exit 1
fi

RELEASE_VERSION=$1
RELEASE_BRANCH=$2
ALLOWED_FILES="package.json|yarn.lock|version.ts|licenseManager.ts|.env|README.md|baseUrl.ts|documentation/ag-grid-docs/src/content/versions/ag-grid-versions.json|.mdoc|SECURITY.md"

# The bump rewrites dependency versions in package.json files, so yarn.lock has to be regenerated
# in the same commit. CI runs `yarn check --integrity` on an exact node_modules cache hit and fails
# every job on the branch when the lockfile is stale, so run the same check here before the push.
# (`yarn install --frozen-lockfile` is not a reliable probe: Yarn 1 passes it on a stale lockfile.)
if ! yarn check --integrity > /dev/null 2>&1; then
  echo "yarn.lock is out of step with the bumped package.json files - running yarn install"
  yarn install --prefer-offline || {
    echo "yarn install failed - check that the bumped dependency versions have been published"
    exit 1
  }
  yarn check --integrity || exit 1
fi

NON_PACKAGE_JSON_COUNT=`git status --porcelain | grep -Ev "package.json|yarn.lock|version.ts|licenseManager.ts|.env|README.md|baseUrl.ts|documentation/ag-grid-docs/src/content/versions/ag-grid-versions.json|.mdoc|SECURITY.md" | wc -l`

if [ $NON_PACKAGE_JSON_COUNT -ne 0 ];
then
  echo "Only the following files should be updated: $ALLOWED_FILES. Please verify the changeset."
  git status --porcelain
  exit 1
fi

git add .
git commit -am "Release $RELEASE_VERSION Prep" --no-verify
git push -u origin "$RELEASE_BRANCH" --no-verify

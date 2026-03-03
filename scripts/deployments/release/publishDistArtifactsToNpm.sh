#!/usr/bin/env bash

TAG="${1:-latest}"

publishModules()
{
  local directory=$1

  for moduleDirectory in `ls $directory`;
  do
    local modulePath="$directory/$moduleDirectory/package"

    echo "PUBLISHING TO NPM: $modulePath"
    npm publish $modulePath --tag $TAG

    if [ $? -ne 0 ]; then
        echo "Error publishing $modulePath"
        exit 1;
    else
        echo "$modulePath published to npm"
    fi
  done
}

publishModules "dist/artifacts/contents/community-modules"
publishModules "dist/artifacts/contents/packages"

sonar-scanner \
-Dsonar.javascript.node.maxspace=8192 \
-Dsonar.organization=ag-grid \
-Dsonar.projectBaseDir=./packages/ \
-Dsonar.sources=./ag-studio,./ag-studio-angular/projects/ag-studio-angular,./ag-studio-react,./ag-studio-vue3 \
-Dsonar.typescript.tsconfigPaths=./ag-studio/tsconfig.lib.json,./ag-studio-angular/projects/ag-studio-angular/tsconfig.lib.prod.json,./ag-studio-react/tsconfig.json,./ag-studio-vue3/tsconfig.json \
-Dsonar.projectKey=ag-studio_next \
-Dsonar.branch.name=latest \
-Dsonar.host.url=https://sonarcloud.io \
-Dsonar.login=ff6a9075d4febbc270e1a1a5dbcdc54bfa426d51 \
-Dsonar.exclusions=**/__tests__/*,**/test.ts,**/tsconfig.typings.json,**/LICENSE.html,**/*.md,**/dist,**/node_modules,**/typings,**/lib,**/*spec.js \
-Dsonar.scanner.force-deprecated-java-version=true \
-Dsonar.coverage.exclusions=**/*

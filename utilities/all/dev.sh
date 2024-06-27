#!/bin/bash

set -eu

MODIFIED=$1

function exampleRunnerFile {
  changedModule=$1

  if [[ "${MODIFIED}" == "ag-grid-docs" ]]; then
    if echo "$NX_FILE_CHANGES" | grep -q -E "/public/example-runner/"; then
      return 0;
    fi
  fi

  return 1;
}

function ignoreProject {
    changedModule=$1

    if exampleRunnerFile $MODIFIED; then
      return 1;
    fi

    if ! echo "$changedModule" | grep -q -E "^@ag-grid-*"; then
       return 0;
    fi

    exclusions=("angular" "react" "vue" "vue3" "solid")
    for exclusion in "${exclusions[@]}";
    do
      if echo "$changedModule" | grep -q -E "$exclusion"; then
          return 0;
      fi
    done

    return 1;
}

if ! ignoreProject $MODIFIED; then
  CHANGED_FILES=$(echo "${NX_FILE_CHANGES}" | xargs -n 1)
  VALID_FILE_COUNT=0
  VALID_FILES=""
  IGNORED_FILE_COUNT=0
  IGNORED_FILES=""
  for filename in ${CHANGED_FILES} ; do
    if [[ ${filename} =~ "/dist/" ]] ; then
      IGNORED_FILE_COUNT=$((IGNORED_FILE_COUNT+1))
      IGNORED_FILES="${IGNORED_FILES} $filename"
    else
      VALID_FILE_COUNT=$((VALID_FILE_COUNT+1))
      VALID_FILES="${VALID_FILES} $filename"
    fi
  done

  if [[ "${MODIFIED}" == "@ag-grid-community/core" ]] ; then
    if [[ "${BUILD_FWS}" == "1" && "${BUILD_PACKAGES}" == "1" ]] ; then
      nx run-many -p @ag-grid-community/client-side-row-model,@ag-grid-community/core,@ag-grid-community/csv-export,@ag-grid-community/infinite-row-model,@ag-grid-enterprise/advanced-filter@ag-grid-enterprise/charts,@ag-grid-enterprise/charts-enterprise,@ag-grid-enterprise/clipboard,@ag-grid-enterprise/column-tool-panel,@ag-grid-enterprise/core,@ag-grid-enterprise/excel-export,@ag-grid-enterprise/filter-tool-panel,@ag-grid-enterprise/master-detail,@ag-grid-enterprise/menu,@ag-grid-enterprise/multi-filter,@ag-grid-enterprise/range-selection,@ag-grid-enterprise/rich-select,@ag-grid-enterprise/row-grouping,@ag-grid-enterprise/server-side-row-model,@ag-grid-enterprise/set-filter,@ag-grid-enterprise/side-bar,@ag-grid-enterprise/sparklines,@ag-grid-enterprise/status-bar,@ag-grid-enterprise/viewport-row-model -t build:types -c watch
      nx build @ag-grid-community/core -t build:package,build:umd,generate-doc-references -c watch
      nx run-many -p ag-grid-community,ag-grid-charts-enterprise -t build:umd
      nx run-many -p @ag-grid-community/angular,ag-grid-angular -t build
    elif [[ "${BUILD_FWS}" == "1" && "${BUILD_PACKAGES}" == "0" ]] ; then
      nx run-many -p @ag-grid-community/client-side-row-model,@ag-grid-community/core,@ag-grid-community/csv-export,@ag-grid-community/infinite-row-model,@ag-grid-enterprise/advanced-filter@ag-grid-enterprise/charts,@ag-grid-enterprise/charts-enterprise,@ag-grid-enterprise/clipboard,@ag-grid-enterprise/column-tool-panel,@ag-grid-enterprise/core,@ag-grid-enterprise/excel-export,@ag-grid-enterprise/filter-tool-panel,@ag-grid-enterprise/master-detail,@ag-grid-enterprise/menu,@ag-grid-enterprise/multi-filter,@ag-grid-enterprise/range-selection,@ag-grid-enterprise/rich-select,@ag-grid-enterprise/row-grouping,@ag-grid-enterprise/server-side-row-model,@ag-grid-enterprise/set-filter,@ag-grid-enterprise/side-bar,@ag-grid-enterprise/sparklines,@ag-grid-enterprise/status-bar,@ag-grid-enterprise/viewport-row-model -t build:types -c watch
      nx run-many -p @ag-grid-community/angular -t build -c watch
      nx build @ag-grid-community/core -t build:package,build:umd,generate-doc-references -c watch
    else
      nx run-many -p @ag-grid-community/client-side-row-model,@ag-grid-community/core,@ag-grid-community/csv-export,@ag-grid-community/infinite-row-model,@ag-grid-enterprise/advanced-filter@ag-grid-enterprise/charts,@ag-grid-enterprise/charts-enterprise,@ag-grid-enterprise/clipboard,@ag-grid-enterprise/column-tool-panel,@ag-grid-enterprise/core,@ag-grid-enterprise/excel-export,@ag-grid-enterprise/filter-tool-panel,@ag-grid-enterprise/master-detail,@ag-grid-enterprise/menu,@ag-grid-enterprise/multi-filter,@ag-grid-enterprise/range-selection,@ag-grid-enterprise/rich-select,@ag-grid-enterprise/row-grouping,@ag-grid-enterprise/server-side-row-model,@ag-grid-enterprise/set-filter,@ag-grid-enterprise/side-bar,@ag-grid-enterprise/sparklines,@ag-grid-enterprise/status-bar,@ag-grid-enterprise/viewport-row-model -t build:types -c watch
      nx build @ag-grid-community/core -t build:package,build:umd,generate-doc-references -c watch
    fi
  elif exampleRunnerFile $MODIFIED; then
    nx generate-examples --batch
  elif [[ "${VALID_FILE_COUNT}" -gt 0 ]] ; then
    echo "[changed]${VALID_FILES}"
    nx run-many -p ${MODIFIED} -t build
    if [[ ${MODIFIED} =~ "@ag-grid" ]] ; then
      if [[ "${BUILD_PACKAGES}" == "1" ]] ; then
        nx run-many -p ag-grid-community,ag-grid-charts-enterprise -t build:umd
      fi
    fi
  fi
else
 echo "$MODIFIED Ignored"
fi



if [ "$#" -ne 1 ]
then
    echo "You must the release version as the first argument"
    exit 1
fi

RELEASE_VERSION=$1

npm dist-tag add @ag-grid-community/angular@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/client-side-row-model@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/core@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/csv-export@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/infinite-row-model@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/react@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/styles@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/theming@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-community/vue3@$RELEASE_VERSION latest

npm dist-tag add @ag-grid-enterprise/advanced-filter@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/charts@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/charts-enterprise@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/clipboard@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/column-tool-panel@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/core@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/excel-export@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/filter-tool-panel@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/master-detail@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/menu@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/multi-filter@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/range-selection@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/rich-select@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/row-grouping@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/server-side-row-model@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/set-filter@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/side-bar@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/sparklines@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/status-bar@$RELEASE_VERSION latest
npm dist-tag add @ag-grid-enterprise/viewport-row-model@$RELEASE_VERSION latest

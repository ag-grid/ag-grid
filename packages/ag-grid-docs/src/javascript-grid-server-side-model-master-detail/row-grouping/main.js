const columnDefs = [
    {field: 'country', rowGroup: true, hide: true},
    {field: 'accountId', hide: true},
    {field: 'name'},
    {field: 'calls'},
    {field: 'totalDuration'}
];

const gridOptions = {
    autoGroupColumnDef: {
        field: 'accountId'
    },
    columnDefs: columnDefs,
    animateRows: true,

    // use the server-side row model
    rowModelType: 'serverSide',

    // enable master detail
    masterDetail: true,

    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'},
                {field: 'number'},
            ],
            onFirstDataRendered(params) {
                // fit the detail grid columns
                params.api.sizeColumnsToFit();
            }
        },
        getDetailRowData: function (params) {
            // supply details records to detail cell renderer (i.e. detail grid)
            params.successCallback(params.data.callRecords);
        }
    },
    onGridReady(params) {
        setTimeout(() => {
            // fit the master grid columns
            params.api.sizeColumnsToFit();

            // arbitrarily expand some master row
            const someRow = params.api.getRowNode("3");
            if (someRow) someRow.setExpanded(true);

        }, 1500);
    }
};

var allData;

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/latest/packages/ag-grid-docs/src/callData.json'}).then(function (data) {

        allData = data;

        const dataSource = {
            getRows: function (getRowParams) {

                // To make the demo look real, wait for 200ms before returning
                setTimeout(function () {
                    var response = getMockServerResponse(getRowParams.request);

                    // call the success callback
                    getRowParams.successCallback(response.rowsThisBlock, response.lastRow);
                }, 200);
            }
        };

        gridOptions.api.setServerSideDatasource(dataSource);
    });
});

// Note this a stripped down mock server implementation which only supports grouping
function getMockServerResponse(request) {
    const groupKeys = request.groupKeys;
    const rowGroupColIds = request.rowGroupCols.map(x => x.id);
    const parentId = groupKeys.length > 0 ? groupKeys.join("") : "";

    const rows = group(allData, rowGroupColIds, groupKeys, parentId);

    const rowsThisBlock = rows.slice(request.startRow, request.endRow);
    const lastRow = rows.length <= request.endRow ? rows.length : -1;

    return {rowsThisBlock, lastRow};
}

function group(data, rowGroupColIds, groupKeys, parentId) {
    const groupColId = rowGroupColIds.shift();
    if (!groupColId) return data;

    const groupedData = _(data).groupBy(x => x[groupColId]).value();

    if (groupKeys.length === 0) {
        return Object.keys(groupedData).map(key => {
            const res = {};

            // Note: the server provides group id's using a simple heuristic based on group keys:
            // i.e. group node ids will be in the following format: 'Russia', 'Russia-2002'
            res['id'] = getGroupId(parentId, key);

            res[groupColId] = key;
            return res;
        });
    }

    return group(groupedData[groupKeys.shift()], rowGroupColIds, groupKeys, parentId);
}

function getGroupId(parentId, key) {
    return parentId ? parentId + "-" + key : key;
}
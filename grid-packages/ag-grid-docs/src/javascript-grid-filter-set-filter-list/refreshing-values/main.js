var list1 = ['Elephant', 'Lion', 'Monkey'];
var list2 = ['Elephant', 'Giraffe', 'Tiger'];

var valuesArray = list1.slice();
var valuesCallbackList = list1;

function valuesCallback(params) {
    setTimeout(function() { params.success(valuesCallbackList); }, 1000);
}

var gridOptions = {
    columnDefs: [
        {
            colId: 'array',
            headerName: 'Values Array',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: valuesArray
            }
        },
        {
            colId: 'callback',
            headerName: 'Values Callback',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: valuesCallback,
                refreshValuesOnOpen: true
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
        resizable: true,
    },
    sideBar: 'filters',
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params) {
    params.api.getToolPanelInstance('filters').expandFilters();
}

function useList(list) {
    console.log('Updating values to ' + list);
    valuesArray.length = 0;
    list.forEach(function(value) { valuesArray.push(value); });

    var filter = gridOptions.api.getFilterInstance('array');
    filter.refreshFilterValues();

    valuesCallbackList = list;
}

function useList1() {
    useList(list1);
}

function useList2() {
    useList(list2);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

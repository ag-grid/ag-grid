import { ClientSideRowModelModule } from 'ag-grid-community';
import { GetRowIdParams, GridApi, GridOptions, IRowNode, ValueParserParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, SetFilterModule]);

var rowIdCounter = 0;
var callCount = 0;

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'topGroup', rowGroup: true, hide: true },
        { field: 'group', rowGroup: true, hide: true },
        { headerName: 'ID', field: 'id', cellClass: 'number-cell', maxWidth: 70 },
        { field: 'a', type: 'valueColumn' },
        { field: 'b', type: 'valueColumn' },
        { field: 'c', type: 'valueColumn' },
        { field: 'd', type: 'valueColumn' },
        {
            headerName: 'Total',
            type: 'totalColumn',
            minWidth: 120,
            // we use getValue() instead of data.a so that it gets the aggregated values at the group level
            valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d")',
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        minWidth: 180,
    },
    columnTypes: {
        valueColumn: {
            minWidth: 90,
            editable: true,
            aggFunc: 'sum',
            cellClass: 'number-cell',
            cellRenderer: 'agAnimateShowChangeCellRenderer',
            filter: 'agNumberColumnFilter',
            valueParser: numberValueParser,
        },
        totalColumn: {
            cellRenderer: 'agAnimateShowChangeCellRenderer',
            cellClass: 'number-cell',
        },
    },
    // set this to true, so only the column in question gets updated
    aggregateOnlyChangedColumns: true,
    aggFuncs: {
        sum: (params) => {
            var values = params && params.values ? params.values : [];
            var result = 0;
            if (values) {
                values.forEach((value) => {
                    if (typeof value === 'number') {
                        result += value;
                    }
                });
            }
            callCount++;
            console.log(callCount + ' aggregation: sum([' + values.join(',') + ']) = ' + result);
            return result;
        },
    },
    groupDefaultExpanded: 1,
    suppressAggFuncInHeader: true,
    getRowId: (params: GetRowIdParams) => String(params.data.id),
    onGridReady: (params) => {
        params.api.setGridOption('rowData', createRowData());
    },
};

function createRowData() {
    var result = [];
    for (var i = 1; i <= 2; i++) {
        for (var j = 1; j <= 5; j++) {
            for (var k = 1; k <= 3; k++) {
                var rowDataItem = createRowItem(i, j, k);
                result.push(rowDataItem);
            }
        }
    }
    return result;
}

function createRowItem(i: number, j: number, k: number) {
    var rowDataItem = {
        id: rowIdCounter++,
        a: (j * k * 863) % 100,
        b: (j * k * 811) % 100,
        c: (j * k * 743) % 100,
        d: (j * k * 677) % 100,
        topGroup: 'Bottom',
        group: 'Group B' + j,
    };
    if (i === 1) {
        rowDataItem.topGroup = 'Top';
        rowDataItem.group = 'Group A' + j;
    }
    return rowDataItem;
}

// converts strings to numbers
function numberValueParser(params: ValueParserParams) {
    console.log('=> updating to ' + params.newValue);
    return Number(params.newValue);
}

function updateOneRecord() {
    var rowNodeToUpdate = pickExistingRowNodeAtRandom(gridApi!);

    if (!rowNodeToUpdate) return;

    var randomValue = createRandomNumber();
    var randomColumnId = pickRandomColumn();

    console.log('updating ' + randomColumnId + ' to ' + randomValue + ' on ', rowNodeToUpdate.data);
    rowNodeToUpdate.setDataValue(randomColumnId, randomValue);
}

function pickRandomColumn() {
    var letters = ['a', 'b', 'c', 'd'];
    var randomIndex = Math.floor(Math.random() * letters.length);
    return letters[randomIndex];
}

function createRandomNumber() {
    return Math.floor(Math.random() * 100);
}

function pickExistingRowItemAtRandom(api: GridApi) {
    var rowNode = pickExistingRowNodeAtRandom(api);
    return rowNode ? rowNode.data : null;
}

function pickExistingRowNodeAtRandom(api: GridApi): IRowNode | undefined {
    var allItems: IRowNode[] = [];
    api.forEachLeafNode(function (rowNode) {
        allItems.push(rowNode);
    });

    if (allItems.length === 0) {
        return undefined;
    }
    var result = allItems[Math.floor(Math.random() * allItems.length)];

    return result;
}

function updateUsingTransaction() {
    var itemToUpdate = pickExistingRowItemAtRandom(gridApi!);
    if (!itemToUpdate) {
        return;
    }

    console.log('updating - before', itemToUpdate);

    itemToUpdate[pickRandomColumn()] = createRandomNumber();
    itemToUpdate[pickRandomColumn()] = createRandomNumber();

    var transaction = {
        update: [itemToUpdate],
    };

    console.log('updating - after', itemToUpdate);

    gridApi!.applyTransaction(transaction);
}

function removeUsingTransaction() {
    var itemToRemove = pickExistingRowItemAtRandom(gridApi!);
    if (!itemToRemove) {
        return;
    }

    var transaction = {
        remove: [itemToRemove],
    };

    console.log('removing', itemToRemove);

    gridApi!.applyTransaction(transaction);
}

function addUsingTransaction() {
    var i = Math.floor(Math.random() * 2);
    var j = Math.floor(Math.random() * 5);
    var k = Math.floor(Math.random() * 3);
    var newItem = createRowItem(i, j, k);

    var transaction = {
        add: [newItem],
    };

    console.log('adding', newItem);

    gridApi!.applyTransaction(transaction);
}

function changeGroupUsingTransaction() {
    var itemToUpdate = pickExistingRowItemAtRandom(gridApi!);
    if (!itemToUpdate) {
        return;
    }

    itemToUpdate.topGroup = itemToUpdate.topGroup === 'Top' ? 'Bottom' : 'Top';

    var transaction = {
        update: [itemToUpdate],
    };

    console.log('updating', itemToUpdate);

    gridApi!.applyTransaction(transaction);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

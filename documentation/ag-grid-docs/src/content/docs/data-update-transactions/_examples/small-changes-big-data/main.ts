import type {
    ColDef,
    DoesFilterPassParams,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IsGroupOpenByDefaultParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    CustomFilterModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { createDataItem, getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    NumberFilterModule,
    RowSelectionModule,
    HighlightChangesModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    CustomFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let aggCallCount = 0;
let compareCallCount = 0;
let filterCallCount = 0;
let gridApi: GridApi;
function myAggFunc(params: IAggFuncParams) {
    aggCallCount++;

    let total = 0;
    for (let i = 0; i < params.values.length; i++) {
        total += params.values[i];
    }
    return total;
}
function myComparator(a: any, b: any) {
    compareCallCount++;
    return a < b ? -1 : 1;
}

function getRowId(params: GetRowIdParams) {
    return String(params.data.id);
}

function onBtDuplicate() {
    // get the first child of the
    const selectedRows = gridApi.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!');
        return;
    }

    const newItems: any = [];
    selectedRows.forEach((selectedRow) => {
        const newItem = createDataItem(
            selectedRow.name,
            selectedRow.distro,
            selectedRow.laptop,
            selectedRow.city,
            selectedRow.value
        );
        newItems.push(newItem);
    });

    timeOperation('Duplicate', () => {
        gridApi.applyTransaction({ add: newItems });
    });
}

function onBtUpdate() {
    // get the first child of the
    const selectedRows = gridApi.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!');
        return;
    }

    const updatedItems: any[] = [];
    selectedRows.forEach((oldItem) => {
        const newValue = Math.floor(Math.random() * 100) + 10;
        const newItem = createDataItem(
            oldItem.name,
            oldItem.distro,
            oldItem.laptop,
            oldItem.city,
            newValue,
            oldItem.id
        );
        updatedItems.push(newItem);
    });

    timeOperation('Update', () => {
        gridApi.applyTransaction({ update: updatedItems });
    });
}

function onBtDelete() {
    // get the first child of the
    const selectedRows = gridApi.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!');
        return;
    }

    timeOperation('Delete', () => {
        gridApi.applyTransaction({ remove: selectedRows });
    });
}

function onBtClearSelection() {
    gridApi!.deselectAll();
}

function timeOperation(name: string, operation: any) {
    aggCallCount = 0;
    compareCallCount = 0;
    filterCallCount = 0;
    const start = new Date().getTime();
    operation();
    const end = new Date().getTime();
    console.log(
        name +
            ' finished in ' +
            (end - start) +
            'ms, aggCallCount = ' +
            aggCallCount +
            ', compareCallCount = ' +
            compareCallCount +
            ', filterCallCount = ' +
            filterCallCount
    );
}

const columnDefs: ColDef[] = [
    { field: 'city', rowGroup: true, hide: true },
    { field: 'laptop', rowGroup: true, hide: true },
    { field: 'distro', sort: 'asc', comparator: myComparator },
    {
        field: 'value',
        enableCellChangeFlash: true,
        aggFunc: myAggFunc,
        filter: {
            component: 'agNumberColumnFilter',
            doesFilterPass: ({ model, node, handlerParams }: DoesFilterPassParams) => {
                filterCallCount++;
                return model == null || handlerParams.getValue(node) > model.filter;
            },
        },
        filterParams: {
            filterOptions: ['greaterThan'],
            maxNumConditions: 1,
        },
    },
];

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    getRowId: getRowId,
    rowSelection: {
        mode: 'multiRow',
        groupSelects: 'descendants',
        headerCheckbox: false,
    },
    autoGroupColumnDef: {
        field: 'name',
    },
    onGridReady: (params) => {
        params.api.setFilterModel({
            value: { filterType: 'number', type: 'greaterThan', filter: 50 },
        });

        timeOperation('Initialisation', () => {
            params.api.setGridOption('rowData', getData());
        });
    },
    isGroupOpenByDefault: isGroupOpenByDefault,
    enableFilterHandlers: true,
};

function isGroupOpenByDefault(params: IsGroupOpenByDefaultParams<IOlympicData, any>) {
    return ['Delhi', 'Seoul'].includes(params.key);
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});

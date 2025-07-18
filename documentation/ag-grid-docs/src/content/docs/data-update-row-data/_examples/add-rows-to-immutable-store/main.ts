import type {
    EditableCallbackParams,
    GetRowIdParams,
    GridApi,
    GridOptions,
    RowEditingStoppedEvent,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([
    ColumnApiModule,
    ClientSideRowModelModule,
    TextEditorModule,
    NumberEditorModule,
    PinnedRowModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let immutableStore: any[] = [];

function addNewRow() {
    gridApi!.setGridOption('pinnedBottomRowData', [{ symbol: null, price: null, group: null }]);
    gridApi!.startEditingCell({ rowIndex: 0, rowPinned: 'bottom', colKey: 'symbol' });
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'Symbol', field: 'symbol' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Group', field: 'group' },
    ],
    defaultColDef: {
        width: 250,
        editable: (params: EditableCallbackParams) => {
            return params.node.id === 'new-row';
        },
    },
    editType: 'fullRow',
    rowData: immutableStore,
    getRowId: (params: GetRowIdParams) => {
        return params.data.symbol ?? 'new-row';
    },
    onGridReady: (params) => {
        immutableStore = getData();
        params.api.setGridOption('rowData', immutableStore);
    },
    onRowEditingStopped: (params: RowEditingStoppedEvent) => {
        const { data } = params;

        gridApi!.setGridOption('pinnedBottomRowData', []);

        if (data.symbol == null) {
            return;
        }

        immutableStore = [data, ...immutableStore];

        gridApi!.setGridOption('rowData', immutableStore);
    },
};

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});

import type {
    EditableCallbackParams,
    GetRowIdParams,
    GridApi,
    GridOptions,
    RowEditingStoppedEvent,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    RowSelectionModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, RowGroupingModule, StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ColumnApiModule,
    TextFilterModule,
    RowSelectionModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    CellSelectionModule,
    RowGroupingModule,
    StatusBarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function getInitialData() {
    const data = [];
    for (let i = 0; i < 5; i++) {
        data.push(createItem());
    }

    return data;
}

let immutableStore: any[] = [];

function addNewRow() {
    gridApi!.setGridOption('pinnedBottomRowData', [{ symbol: null, price: null, group: null }]);
    gridApi!.startEditingCell({ rowIndex: 0, rowPinned: 'bottom', colKey: 'symbol' });
}

function commitNewRow(rowData: { group: string; symbol: string; price: number }) {
    const newStore = immutableStore.slice();

    newStore.splice(0, 0, rowData);
    immutableStore = newStore;

    gridApi!.setGridOption('rowData', immutableStore);
}

function createItem() {
    const item = {
        group: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        symbol: createUniqueRandomSymbol(),
        price: Math.floor(Math.random() * 100),
    };
    return item;
}

// creates a unique symbol, eg 'ADG' or 'ZJD'
function createUniqueRandomSymbol() {
    let symbol: any;
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let isUnique = false;
    while (!isUnique) {
        symbol = '';
        // create symbol
        for (let i = 0; i < 3; i++) {
            symbol += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        // check uniqueness
        isUnique = true;
        immutableStore.forEach((oldItem) => {
            if (oldItem.symbol === symbol) {
                isUnique = false;
            }
        });
    }

    return symbol;
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
    rowSelection: {
        mode: 'multiRow',
    },
    cellSelection: true,
    autoGroupColumnDef: {
        headerName: 'Symbol',
        cellRenderer: 'agGroupCellRenderer',
        field: 'symbol',
    },
    statusBar: {
        statusPanels: [{ statusPanel: 'agAggregationComponent', align: 'right' }],
    },
    editType: 'fullRow',
    groupDefaultExpanded: 1,
    rowData: immutableStore,
    getRowId: (params: GetRowIdParams) => {
        return params.data.symbol ?? 'new-row';
    },
    onGridReady: (params) => {
        immutableStore = [];
        immutableStore = getInitialData();
        params.api.setGridOption('rowData', immutableStore);
    },
    onRowEditingStopped: (params: RowEditingStoppedEvent) => {
        const { symbol, price, group } = params.data;

        gridApi!.setGridOption('pinnedBottomRowData', []);

        if (symbol == null && price == null && group == null) {
            return;
        }

        commitNewRow({ symbol, group, price });
    },
};

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});

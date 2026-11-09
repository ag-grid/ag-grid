import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelApiModule, ClientSideRowModelModule, RowApiModule]);

interface Trade {
    id: number;
    symbol: string;
    price: number;
}

const SYMBOLS = ['AAPL', 'AMZN', 'GOOG', 'META', 'MSFT', 'NVDA', 'TSLA'];

const createTrade = (id: number): Trade => ({
    id,
    symbol: SYMBOLS[id % SYMBOLS.length],
    price: 100 + ((id * 37) % 400),
});

let nextId = 100;

let gridApi: GridApi<Trade>;

const gridOptions: GridOptions<Trade> = {
    columnDefs: [{ field: 'id', headerName: 'Trade ID' }, { field: 'symbol' }, { field: 'price' }],
    defaultColDef: {
        flex: 1,
    },
    rowData: Array.from({ length: 100 }, (_, id) => createTrade(id)),
    getRowId: ({ data }) => String(data.id),
    maintainRowsInViewOnDataUpdate: true,
};

function onAddRowsAbove() {
    const add = Array.from({ length: 5 }, () => createTrade(nextId++));
    gridApi!.applyTransaction({ add, addIndex: 0 });
}

function onRemoveRowsAbove() {
    const remove: Trade[] = [];
    for (let i = 0; i < 5; i++) {
        const data = gridApi!.getDisplayedRowAtIndex(i)?.data;
        if (data) {
            remove.push(data);
        }
    }
    gridApi!.applyTransaction({ remove });
}

function onMaintainRowsInViewChanged() {
    const checked = document.querySelector<HTMLInputElement>('#maintainRowsInView')!.checked;
    gridApi!.setGridOption('maintainRowsInViewOnDataUpdate', checked);
}

document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});

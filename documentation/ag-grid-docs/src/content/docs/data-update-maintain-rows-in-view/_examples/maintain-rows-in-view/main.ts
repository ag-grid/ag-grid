import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelApiModule, ClientSideRowModelModule]);

interface Trade {
    id: number;
    symbol: string;
    price: number;
}

const SYMBOLS = ['AAPL', 'AMZN', 'GOOG', 'META', 'MSFT', 'NVDA', 'TSLA'];

let nextId = 0;
const createTrades = (count: number): Trade[] =>
    Array.from({ length: count }, () => {
        const id = nextId++;
        return { id, symbol: SYMBOLS[id % SYMBOLS.length], price: 100 + ((id * 37) % 400) };
    });

let gridApi: GridApi<Trade>;

const gridOptions: GridOptions<Trade> = {
    columnDefs: [{ field: 'id', headerName: 'Trade ID' }, { field: 'symbol' }, { field: 'price' }],
    defaultColDef: {
        flex: 1,
    },
    rowData: createTrades(100),
    getRowId: ({ data }) => String(data.id),
    maintainRowsInViewOnDataUpdate: true,
};

function onAddRowsAbove() {
    gridApi!.applyTransaction({ add: createTrades(5), addIndex: 0 });
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

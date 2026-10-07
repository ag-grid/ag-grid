import type { GetRowIdParams, GridApi, GridOptions, VisibleRowRef } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    VisibleRowsModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    HighlightChangesModule,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    VisibleRowsModule,
]);

interface Stock {
    id: string;
    symbol: string;
    price: number;
}

const subscribed = new Map<string, VisibleRowRef>();
let updatesSent = 0;
let dataVersion = 0;
let stopSubscription: (() => void) | undefined;
let streamTimer: ReturnType<typeof setInterval> | undefined;

let gridApi: GridApi<Stock>;

function createRowData(): Stock[] {
    dataVersion++;
    return Array.from({ length: 1000 }, (_, i) => ({
        id: `${dataVersion}-${i}`,
        symbol: `STK${String(i).padStart(4, '0')}`,
        price: Math.round(Math.random() * 10000) / 100,
    }));
}

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'symbol', filter: 'agTextColumnFilter' },
        { field: 'price', filter: 'agNumberColumnFilter', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1 },
    rowData: createRowData(),
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
};

function renderCount() {
    document.querySelector('#subscribedCount')!.textContent = String(subscribed.size);
    document.querySelector('#updatesSent')!.textContent = String(updatesSent);
}

function addLogEntry(text: string) {
    const log = document.querySelector('#log')!;
    const entry = document.createElement('li');
    entry.textContent = text;
    log.prepend(entry);
    while (log.children.length > 8) {
        log.lastElementChild!.remove();
    }
}

function startSubscription() {
    stopSubscription = gridApi.subscribeToVisibleRows({
        onSubscribe: (rows, params) => {
            rows.forEach((row) => subscribed.set(row.id, row));
            addLogEntry(`subscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
        onUnsubscribe: (rows, params) => {
            rows.forEach((row) => subscribed.delete(row.id));
            addLogEntry(`unsubscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
    });
}

function startStream() {
    // only the subscribed rows receive price updates
    streamTimer = setInterval(() => {
        const update: Stock[] = [];
        for (const id of subscribed.keys()) {
            const data = gridApi.getRowNode(id)?.data;
            if (data) {
                update.push({ ...data, price: Math.round((data.price + Math.random() - 0.5) * 100) / 100 });
            }
        }
        updatesSent += update.length;
        gridApi.applyTransactionAsync({ update });
        renderCount();
    }, 1000);
}

function resetData() {
    gridApi.setGridOption('rowData', createRowData());
}

function stopStream() {
    clearInterval(streamTimer);
    stopSubscription?.();
    stopSubscription = undefined;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    startSubscription();
    startStream();
});

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
    themeQuartz,
} from 'ag-grid-community';

// Opt into dev-only validation diagnostics, surfaced in an overlay over each grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule]);

const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];
const rowData = [
    { id: 'tesla', make: 'Tesla', model: 'Model Y', price: 64950 },
    { id: 'ford', make: 'Ford', model: 'F-Series', price: 33850 },
    { id: 'toyota', make: 'Toyota', model: 'Corolla', price: 29600 },
];

const gridOptionsA: GridOptions = { columnDefs, rowData, getRowId: (params) => params.data.id };
const topApi: GridApi = createGrid(document.querySelector<HTMLElement>('#gridA')!, gridOptionsA);

const gridOptionsB: GridOptions = { columnDefs, rowData, getRowId: (params) => params.data.id };
const bottomApi: GridApi = createGrid(document.querySelector<HTMLElement>('#gridB')!, gridOptionsB);

function apiFor(grid: string): GridApi {
    return grid === 'a' ? topApi : bottomApi;
}

// Updating an initial-only option after creation emits warning #22 on the targeted grid.
function triggerWarning(grid: string) {
    apiFor(grid).setGridOption('tooltipInteraction', true);
}

// A theme param given a value of the wrong type can't be converted to CSS, emitting error #107 while
// the grid regenerates its styles. `accentColor` is used so the skipped value falls back to the theme
// default rather than breaking the layout. The error is reported from theme code that runs inside the
// grid's scope, so it self-attributes to that grid instead of showing on every grid.
function triggerError(grid: string) {
    apiFor(grid).setGridOption('theme', themeQuartz.withParams({ accentColor: true as any }));
}

// An async transaction is flushed by the grid on a later frame, so the non-string row-id warning
// (#25) it produces is emitted from the grid's own async work rather than a synchronous call. It
// self-attributes through the grid's log bean, so it stays on the grid that ran the transaction.
function triggerAsyncWarning(grid: string) {
    apiFor(grid).applyTransactionAsync({ add: [{ id: 4, make: 'Rivian', model: 'R1T', price: 73000 }] });
}

// Calling the API of a destroyed grid emits warning #26. There is no grid left to own the diagnostic,
// so it can't be attributed and instead surfaces on the other, still-live grid.
function destroyThenCallApi(grid: string) {
    const api = apiFor(grid);
    api.destroy();
    api.exportDataAsExcel();
}

if (typeof window !== 'undefined') {
    // Attach external event handlers to window so they can be called from index.html
    (<any>window).triggerWarning = triggerWarning;
    (<any>window).triggerError = triggerError;
    (<any>window).triggerAsyncWarning = triggerAsyncWarning;
    (<any>window).destroyThenCallApi = destroyThenCallApi;
}

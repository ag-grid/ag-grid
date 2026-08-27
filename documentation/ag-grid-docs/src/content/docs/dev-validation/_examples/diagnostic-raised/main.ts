import type { ColDef, DiagnosticRaisedEvent, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// The overlay is turned off so that the diagnostics reaching the callback are the only thing on show.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations({ showOverlayOn: [] });
}

ModuleRegistry.registerModules([AllCommunityModule]);

function onDiagnosticRaised(event: DiagnosticRaisedEvent) {
    const item = document.createElement('li');
    item.textContent = `#${event.id} (${event.severity}): ${event.message}`;
    document.querySelector('#diagnosticList')!.appendChild(item);
}

const gridOptions: GridOptions = {
    columnDefs: [
        // A stray property the grid does not recognise (as a prop-spreading wrapper might add),
        // surfacing warnings #307 (per property) and #310 (summary).
        { field: 'make', notAColumnProperty: true } as ColDef,
        { field: 'model' },
        { field: 'price' },
    ],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
        { make: 'Toyota', model: 'Corolla', price: 29600 },
    ],
    onDiagnosticRaised,
};

let api: GridApi;

api = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

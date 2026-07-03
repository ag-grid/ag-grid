import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// Enable development validations so captured diagnostics surface in an overlay over the grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
    columnDefs: [
        // A stray property the grid does not recognise (as a prop-spreading wrapper might add),
        // surfacing warnings #307 (per property) and #310 (summary) in the overlay.
        { field: 'make', notAColumnProperty: true } as ColDef,
        { field: 'model' },
        { field: 'price' },
    ],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
        { make: 'Toyota', model: 'Corolla', price: 29600 },
    ],
};

let api: GridApi;

api = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

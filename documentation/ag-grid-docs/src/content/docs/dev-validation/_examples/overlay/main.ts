import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

// Register the ValidationModule (with the overlay enabled) alongside the community modules. Registering
// it in the modules array — rather than via enableDevValidations — is what lets the framework example
// generators carry it into the modules prop.
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule.with({ overlay: 'all' })]);

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

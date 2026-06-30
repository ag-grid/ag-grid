import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

// Register the dev-only ValidationModule (configured to show the overlay) so diagnostics surface in an
// overlay over the grid. Registering it in the modules array (rather than via the enableDevValidations
// helper) is what lets the framework example generators carry it into the modules prop.
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule.with({ overlay: 'all' })]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
        { make: 'Toyota', model: 'Corolla', price: 29600 },
    ],
    // The SideBar requires an enterprise module that is not registered here, so the grid emits a
    // missing-module error that the dev overlay displays over the live grid.
    sideBar: true,
};

let api: GridApi;

api = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

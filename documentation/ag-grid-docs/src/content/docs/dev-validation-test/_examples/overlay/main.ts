import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// Opt into dev-only validation diagnostics so they surface in an overlay over the grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule]);

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

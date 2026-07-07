import type { GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// Opt into dev-only validation diagnostics so the standalone bootstrap-failure panel is rendered.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
    // The serverSide row model module is not registered, so grid creation aborts before any grid
    // exists and the standalone bootstrap-failure panel is rendered instead.
    rowModelType: 'serverSide',
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

import type { GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

// Register the dev-only ValidationModule (configured to show the overlay) so the bootstrap-failure panel
// is rendered. Registering it in the modules array (rather than via the enableDevValidations helper) is
// what lets the framework example generators carry it into the modules prop.
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule.with({ overlay: 'all' })]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
    // The serverSide row model module is not registered, so grid creation aborts before any grid
    // exists and the standalone bootstrap-failure panel is rendered instead.
    rowModelType: 'serverSide',
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

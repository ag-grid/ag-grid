import type { GetDetailRowDataParams, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

// Register the dev-only ValidationModule (configured to show the overlay) alongside MasterDetailModule.
// Registering ValidationModule in the modules array (rather than via the enableDevValidations helper) is
// what lets the framework example generators carry it into the modules prop.
ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule, ValidationModule.with({ overlay: 'all' })]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make', cellRenderer: 'agGroupCellRenderer' }, { field: 'model' }, { field: 'price' }],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
    ],
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'callId' }, { field: 'duration' }],
            // An invalid grid option on the detail grid. The resulting error shows on the detail grid's
            // own overlay and bubbles up to the master grid's overlay.
            notAValidGridOption: true,
        } as GridOptions,
        getDetailRowData: (params: GetDetailRowDataParams) => {
            params.successCallback([
                { callId: 1, duration: 42 },
                { callId: 2, duration: 74 },
            ]);
        },
    },
    // Expand the first master row on load so the detail grid is created and its diagnostic surfaces
    // without interaction.
    onFirstDataRendered: (params) => {
        params.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    },
};

let api: GridApi;

api = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

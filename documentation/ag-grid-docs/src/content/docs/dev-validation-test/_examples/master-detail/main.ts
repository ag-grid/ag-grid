import type { GetDetailRowDataParams, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

// Opt into dev-only validation diagnostics, surfaced in an overlay over each grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make', cellRenderer: 'agGroupCellRenderer' }, { field: 'model' }, { field: 'price' }],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
    ],
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                // An invalid column def property on the detail grid column. The resulting error shows on
                // the detail grid's own overlay; diagnostics stay on the grid that emitted them, so the
                // master grid is unaffected.
                { field: 'duration', notAValidColumnDefProperty: true },
            ],
            // An invalid grid option on the detail grid. The resulting error shows on the detail grid's
            // own overlay; diagnostics stay on the grid that emitted them, so the master grid is unaffected.
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

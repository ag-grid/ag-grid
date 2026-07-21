import type { ColDef, GridApi, GridOptions, GridReadyEvent, PdfStyleCallbackParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

import { data } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    PdfExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const columnDefs: ColDef<IOlympicData>[] = [
    { field: 'athlete', minWidth: 220, sort: 'asc' },
    { field: 'country', minWidth: 180 },
    { field: 'sport', minWidth: 140 },
    { field: 'total' },
];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
    onGridReady: (params: GridReadyEvent) => {
        params.api.setGridOption('rowData', data);
    },

    defaultPdfExportParams: {
        currentElementStyleCallback: (params: PdfStyleCallbackParams) => {
            if (params.type === 'header') {
                return {
                    backgroundColor: '#e0f2fe',
                    color: '#0c4a6e',
                    fontFamily: 'Helvetica-Bold',
                };
            }
        },
    },
};

function onBtExport() {
    gridApi!.exportDataAsPdf();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

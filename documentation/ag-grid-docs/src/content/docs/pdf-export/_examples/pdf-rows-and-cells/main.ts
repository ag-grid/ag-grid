import type { CellStyle, CellStyleFunc, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowStyleModule,
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
    CellStyleModule,
    RowStyleModule,
    PdfExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const cellStyle: CellStyleFunc = (params) => {
    const total = Number(params.value ?? 0);

    if (total >= 5) {
        return {
            backgroundColor: '#e1f3e8',
            color: '#1b5e20',
            fontWeight: '700',
        } as CellStyle;
    }

    if (total <= 2) {
        return {
            color: '#8b1d1d',
            fontWeight: '700',
        };
    }

    return undefined;
};

const columnDefs: ColDef<IOlympicData>[] = [
    { field: 'athlete', minWidth: 220, sort: 'asc' },
    { field: 'country', minWidth: 180 },
    { field: 'sport', minWidth: 140 },
    {
        field: 'total',
        headerStyle: () => ({
            backgroundColor: '#dbeafe',
            color: '#0f172a',
            fontWeight: '700',
        }),
        cellStyle,
    },
];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
    getRowStyle: (params) => ((params.data?.athlete ?? '') === '' ? { backgroundColor: '#da4d4d' } : undefined),
    onGridReady: (params: GridReadyEvent) => {
        params.api.setGridOption('rowData', data);
    },
};

function onSkipStyleCallbacksChange() {
    const skipStyleCallbacks = document.querySelector<HTMLInputElement>('#skipStyleCallbacks')?.checked ?? false;
    gridApi!.setGridOption('defaultPdfExportParams', { skipStyleCallbacks });
}

function onBtExport() {
    gridApi!.exportDataAsPdf();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

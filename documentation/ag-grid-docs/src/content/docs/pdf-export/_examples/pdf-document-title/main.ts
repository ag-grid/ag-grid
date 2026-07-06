import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

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

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Group A',
            children: [
                { field: 'athlete', minWidth: 200 },
                { field: 'country', minWidth: 200 },
            ],
        },
        {
            headerName: 'Group B',
            children: [
                { field: 'sport', minWidth: 150 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
        },
    ],
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
    defaultPdfExportParams: {
        documentTitle: {
            data: { value: 'Quarterly Results' },
            style: {
                fontSize: 16,
                padding: 6,
                margin: { bottom: 10 },
                backgroundColor: '#f3f6fb',
                borderColor: '#c3d4ea',
                borderWidth: 1,
                color: '#123a5a',
                alignment: 'center',
            },
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

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});

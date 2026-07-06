import type { GridApi, GridOptions, ProcessRowGroupForExportParams } from 'ag-grid-community';
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
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 160 },
        { field: 'sport', minWidth: 140 },
        { field: 'total' },
    ],
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
    defaultPdfExportParams: {
        getCustomContentBelowRow: (params: ProcessRowGroupForExportParams) => {
            const rowIndex = params.node.rowIndex ?? 0;
            if ((rowIndex + 1) % 5 !== 0) {
                return;
            }

            return [
                [
                    {
                        data: { value: 'Section break' },
                        mergeAcross: 3,
                        style: {
                            backgroundColor: '#fff4cc',
                            borderColor: '#f0c36d',
                            borderWidth: 1,
                            color: '#7a5400',
                            padding: 6,
                            alignment: 'center',
                        },
                    },
                ],
            ];
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

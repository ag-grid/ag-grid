import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { CellClassParams, GridReadyEvent, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ExcelExportModule, MenuModule]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    { field: 'athlete' },
    { field: 'sport', minWidth: 150 },
    {
        headerName: 'Medals',
        children: [
            { field: 'gold', headerClass: 'gold-header' },
            { field: 'silver', headerClass: 'silver-header' },
            { field: 'bronze', headerClass: 'bronze-header' },
        ],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },

    columnDefs: columnDefs,

    defaultExcelExportParams: {
        headerRowHeight: 30,
    },

    excelStyles: [
        {
            id: 'header',
            alignment: {
                vertical: 'Center',
            },
            interior: {
                color: '#f8f8f8',
                pattern: 'Solid',
                patternColor: undefined,
            },
            borders: {
                borderBottom: {
                    color: '#ffab00',
                    lineStyle: 'Continuous',
                    weight: 1,
                },
            },
        },
        {
            id: 'headerGroup',
            font: {
                bold: true,
            },
        },
        {
            id: 'gold-header',
            interior: {
                color: '#E4AB11',
                pattern: 'Solid',
            },
        },
        {
            id: 'silver-header',
            interior: {
                color: '#bbb4bb',
                pattern: 'Solid',
            },
        },
        {
            id: 'bronze-header',
            interior: {
                color: '#be9088',
                pattern: 'Solid',
            },
        },
    ],
};

function onBtnExportDataAsExcel() {
    gridApi!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef, ColGroupDef, GridApi, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MenuModule]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Athlete Details',
        children: [
            {
                field: 'athlete',
                width: 180,
            },
            {
                field: 'age',
                width: 90,
            },
            { headerName: 'Country', field: 'country', width: 140 },
        ],
    },
    {
        headerName: 'Sports Results',
        children: [
            { field: 'sport', width: 140 },
            {
                columnGroupShow: 'closed',
                field: 'total',
                width: 100,
            },
            {
                columnGroupShow: 'open',
                field: 'gold',
                width: 100,
            },
            {
                columnGroupShow: 'open',
                field: 'silver',
                width: 100,
            },
            {
                columnGroupShow: 'open',
                field: 'bronze',
                width: 100,
            },
        ],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    // debug: true,
    columnDefs: columnDefs,
    rowData: null,
    defaultExcelExportParams: {
        allColumns: true,
        freezeRows: (params) => {
            const node = params.node;
            if (node == null) {
                return true;
            }
            return node.rowIndex! < 20;
        },
        freezeColumns: (params) => params.column.getColId() !== 'gold',
    },
};

function onBtExport() {
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

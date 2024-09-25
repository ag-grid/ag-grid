import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MenuModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Athlete',
            children: [{ field: 'athlete', filter: true }, { field: 'age' }, { field: 'country', filter: true }],
        },
        {
            headerName: 'Medals',
            children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
        },
        { field: 'total' },
    ],
    defaultColDef: {
        filter: false,
        minWidth: 100,
        flex: 1,
    },
    defaultExcelExportParams: {
        exportAsExcelTable: true,
    },
};

function onBtExport() {
    gridApi!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});

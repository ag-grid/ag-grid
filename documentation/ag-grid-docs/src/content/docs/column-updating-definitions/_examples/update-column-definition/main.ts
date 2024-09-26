import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function getColumnDefs(): ColDef<IOlympicData>[] {
    return [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'date' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ];
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        initialWidth: 100,
        filter: true,
    },
    columnDefs: getColumnDefs(),
};

function setHeaderNames() {
    const columnDefs = getColumnDefs();
    columnDefs.forEach((colDef, index) => {
        colDef.headerName = 'C' + index;
    });
    gridApi!.setGridOption('columnDefs', columnDefs);
}

function removeHeaderNames() {
    const columnDefs = getColumnDefs();
    columnDefs.forEach((colDef, index) => {
        colDef.headerName = undefined;
    });
    gridApi!.setGridOption('columnDefs', columnDefs);
}

function setValueFormatters() {
    const columnDefs = getColumnDefs();
    columnDefs.forEach((colDef, index) => {
        colDef.valueFormatter = function (params) {
            return '[ ' + params.value + ' ]';
        };
    });
    gridApi!.setGridOption('columnDefs', columnDefs);
}

function removeValueFormatters() {
    const columnDefs = getColumnDefs();
    columnDefs.forEach((colDef, index) => {
        colDef.valueFormatter = undefined;
    });
    gridApi!.setGridOption('columnDefs', columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});

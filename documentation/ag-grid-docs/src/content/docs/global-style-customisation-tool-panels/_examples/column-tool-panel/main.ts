import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowData: null,
    columnDefs: [
        {
            headerName: 'Athlete',
            children: [
                { field: 'athlete', minWidth: 170, rowGroup: true },
                { field: 'age', rowGroup: true },
                { field: 'country' },
            ],
        },
        {
            headerName: 'Event',
            children: [{ field: 'year' }, { field: 'date' }, { field: 'sport' }],
        },
        {
            headerName: 'Medals',
            children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }, { field: 'total' }],
        },
    ],
    defaultColDef: {
        editable: true,
        filter: true,
    },
    sideBar: 'columns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

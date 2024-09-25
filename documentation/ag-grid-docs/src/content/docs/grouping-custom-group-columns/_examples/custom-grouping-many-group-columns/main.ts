import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Country',
        minWidth: 200,
        // this tells the grid what values to put into the cell
        showRowGroup: 'country',
        // this tells the grid what to use to render the cell
        cellRenderer: 'agGroupCellRenderer',
    },
    {
        headerName: 'Year',
        minWidth: 200,
        showRowGroup: 'year',
        cellRenderer: 'agGroupCellRenderer',
    },
    // these are the two columns we use to group by. we also hide them, so there
    // is no duplication with the values above
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },

    { field: 'athlete', minWidth: 220 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    groupDisplayType: 'custom',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

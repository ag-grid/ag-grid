import { ColDef, Grid, GridOptions } from '@ag-grid-community/core';
import { CustomGroupCellRenderer } from './customGroupCellRenderer_typescript';

const columnDefs: ColDef[] = [
    {
        field: 'country',
        rowGroup: true,
        hide: true,
    },
    {
        field: 'year',
        rowGroup: true,
        hide: true,
    },
    {
        field: 'athlete',
    },
    {
        field: 'total',
        aggFunc: 'sum',

    }
];

const autoGroupColumnDef: ColDef = {
    cellRenderer: CustomGroupCellRenderer,
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoGroupColumnDef: autoGroupColumnDef,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        resizable: true,
    },
    groupDefaultExpanded: 1,
    animateRows: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then(response => response.json())
        .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})

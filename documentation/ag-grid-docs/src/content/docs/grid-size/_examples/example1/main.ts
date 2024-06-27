import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridSizeChangedEvent,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'age', minWidth: 70, maxWidth: 90 },
        { field: 'country', minWidth: 130 },
        { field: 'year', minWidth: 70, maxWidth: 90 },
        { field: 'date', minWidth: 120 },
        { field: 'sport', minWidth: 120 },
        { field: 'gold', minWidth: 80 },
        { field: 'silver', minWidth: 80 },
        { field: 'bronze', minWidth: 80 },
        { field: 'total', minWidth: 80 },
    ],
    onGridSizeChanged: onGridSizeChanged,
    onFirstDataRendered: onFirstDataRendered,
};

function onGridSizeChanged(params: GridSizeChangedEvent) {
    // get the current grids width
    var gridWidth = document.querySelector('.ag-body-viewport')!.clientWidth;

    // keep track of which columns to hide/show
    var columnsToShow = [];
    var columnsToHide = [];

    // iterate over all columns (visible or not) and work out
    // now many columns can fit (based on their minWidth)
    var totalColsWidth = 0;
    var allColumns = params.api.getColumns();
    if (allColumns && allColumns.length > 0) {
        for (var i = 0; i < allColumns.length; i++) {
            var column = allColumns[i];
            totalColsWidth += column.getMinWidth();
            if (totalColsWidth > gridWidth) {
                columnsToHide.push(column.getColId());
            } else {
                columnsToShow.push(column.getColId());
            }
        }
    }

    // show/hide columns based on current grid width
    params.api.setColumnsVisible(columnsToShow, true);
    params.api.setColumnsVisible(columnsToHide, false);

    // wait until columns stopped moving and fill out
    // any available space to ensure there are no gaps
    window.setTimeout(() => {
        params.api.sizeColumnsToFit();
    }, 10);
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.sizeColumnsToFit();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

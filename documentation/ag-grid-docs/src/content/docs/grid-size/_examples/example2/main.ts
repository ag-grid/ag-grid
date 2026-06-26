import type {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
    GridSizeChangedEvent,
    RowHeightParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RenderApiModule,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelApiModule, RenderApiModule, RowApiModule, ClientSideRowModelModule]);

let minRowHeight = 25;
let currentRowHeight: number;

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete', width: 140 },
        { field: 'age', width: 60 },
        { field: 'country', width: 130 },
        { field: 'year', width: 70 },
        { field: 'date', width: 110 },
        { field: 'sport', width: 110 },
        { field: 'gold', flex: 1 },
        { field: 'silver', flex: 1 },
        { field: 'bronze', flex: 1 },
        { field: 'total', flex: 1 },
    ],

    rowData: getData(),
    onGridReady: (params: GridReadyEvent) => {
        minRowHeight = params.api.getSizesForCurrentTheme().rowHeight;
        currentRowHeight = minRowHeight;
    },
    onFirstDataRendered: onFirstDataRendered,
    onGridSizeChanged: onGridSizeChanged,
    getRowHeight: (params: RowHeightParams) => {
        return currentRowHeight;
    },
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    updateRowHeight(params);
}

function onGridSizeChanged(params: GridSizeChangedEvent) {
    updateRowHeight(params);
}

const updateRowHeight = (params: { api: GridApi }) => {
    // get the height of the grid body - this excludes the height of the headers
    const gridViewport = document.querySelector<HTMLElement>('.ag-grid-viewport');
    const topRows = document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows');
    const bottomRows = document.querySelector<HTMLElement>('.ag-grid-pinned-bottom-rows');

    if (!gridViewport) {
        return;
    }

    const gridHeight = gridViewport.clientHeight - (topRows?.clientHeight ?? 0) - (bottomRows?.clientHeight ?? 0);
    // get the rendered rows
    const renderedRowCount = params.api.getDisplayedRowCount();
    if (renderedRowCount === 0) {
        return;
    }

    // if the rendered rows * min height is greater than available height, just set the height
    // to the min and let the scrollbar do its thing
    if (renderedRowCount * minRowHeight >= gridHeight) {
        if (currentRowHeight !== minRowHeight) {
            currentRowHeight = minRowHeight;
            params.api.resetRowHeights();
        }
    } else {
        // set the height of the row to the grid height / number of rows available
        currentRowHeight = Math.floor(gridHeight / renderedRowCount);
        params.api.resetRowHeights();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

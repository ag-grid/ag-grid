import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, RowClassParams, RowStyle, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

import { CustomPinnedRowRenderer } from './customPinnedRowRenderer_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: columnDefs,
    rowData: null,
    // no rows to pin to start with
    pinnedTopRowData: [{ athlete: 'TOP (athlete)', country: 'TOP (country)', sport: 'TOP (sport)' }],
    pinnedBottomRowData: [{ athlete: 'BOTTOM (athlete)', country: 'BOTTOM (country)', sport: 'BOTTOM (sport)' }],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

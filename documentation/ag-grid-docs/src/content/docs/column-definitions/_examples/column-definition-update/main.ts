import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, RowGroupingModule]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }, { field: 'sport' }];

const updatedHeaderColumnDefs: ColDef[] = [
    { field: 'athlete', headerName: 'C1' },
    { field: 'age', headerName: 'C2' },
    { field: 'country', headerName: 'C3' },
    { field: 'sport', headerName: 'C4' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    rowData: null,
    autoSizeStrategy: {
        type: 'fitGridWidth',
    },
};

function onBtUpdateHeaders() {
    gridApi!.setGridOption('columnDefs', updatedHeaderColumnDefs);
}

function onBtRestoreHeaders() {
    gridApi!.setGridOption('columnDefs', columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

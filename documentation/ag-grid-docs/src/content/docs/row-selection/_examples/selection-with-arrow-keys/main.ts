import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CellPosition, GridApi, GridOptions, NavigateToNextCellParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'age', maxWidth: 90 },
        { field: 'country', minWidth: 150 },
        { field: 'year', maxWidth: 90 },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowSelection: 'single',
    rowData: null,
    navigateToNextCell: navigateToNextCell,
};

function navigateToNextCell(params: NavigateToNextCellParams): CellPosition | null {
    const suggestedNextCell = params.nextCellPosition;

    const KEY_UP = 'ArrowUp';
    const KEY_DOWN = 'ArrowDown';

    const noUpOrDownKey = params.key !== KEY_DOWN && params.key !== KEY_UP;
    if (noUpOrDownKey || !suggestedNextCell) {
        return suggestedNextCell;
    }

    const nodeToSelect = params.api.getDisplayedRowAtIndex(suggestedNextCell.rowIndex);
    if (nodeToSelect) {
        nodeToSelect.setSelected(true);
    }

    return suggestedNextCell;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

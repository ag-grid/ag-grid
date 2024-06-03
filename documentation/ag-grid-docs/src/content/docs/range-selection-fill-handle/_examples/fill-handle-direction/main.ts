import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, RangeSelectionModule]);

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
        editable: true,
        cellDataType: false,
    },
    enableRangeSelection: true,
    enableFillHandle: true,
    fillHandleDirection: 'x',
};

function fillHandleAxis(direction: 'x' | 'y' | 'xy') {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.ag-fill-direction'));
    var button = document.querySelector('.ag-fill-direction.' + direction)!;

    buttons.forEach((btn) => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');
    gridApi!.setGridOption('fillHandleDirection', direction);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

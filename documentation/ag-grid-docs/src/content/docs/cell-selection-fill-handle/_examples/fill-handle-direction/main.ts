import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type GridApi, type GridOptions, type SelectionOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule]);

let gridApi: GridApi<IOlympicData>;

const selectionOptions: SelectionOptions = {
    mode: 'cell',
    handle: {
        mode: 'fill',
        direction: 'x',
    },
};

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
    selectionOptions,
};

function fillHandleAxis(direction: 'x' | 'y' | 'xy') {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.ag-fill-direction'));
    var button = document.querySelector('.ag-fill-direction.' + direction)!;

    buttons.forEach((btn) => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');

    if (
        selectionOptions.mode === 'cell' &&
        typeof selectionOptions.handle !== 'boolean' &&
        selectionOptions.handle?.mode === 'fill'
    ) {
        selectionOptions.handle.direction = direction;
        gridApi!.setGridOption('selectionOptions', selectionOptions);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

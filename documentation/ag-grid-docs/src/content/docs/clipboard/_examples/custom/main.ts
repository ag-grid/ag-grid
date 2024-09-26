import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions, SendToClipboardParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RangeSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, MenuModule, RangeSelectionModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 150 },
        { field: 'year' },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],

    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
    },

    selection: { mode: 'cell' },

    sendToClipboard: sendToClipboard,
};

function sendToClipboard(params: SendToClipboardParams) {
    console.log('send to clipboard called with data:');
    console.log(params.data);
}

function onBtCopyRows() {
    gridApi!.copySelectedRowsToClipboard();
}

function onBtCopyRange() {
    gridApi!.copySelectedRangeToClipboard();
}

function onModeChange() {
    const mode = document.querySelector<HTMLSelectElement>('#select-mode')?.value as any;
    gridApi.setGridOption('selection', mode ? { mode } : undefined);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

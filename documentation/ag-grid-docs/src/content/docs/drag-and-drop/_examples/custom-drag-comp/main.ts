import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { getData } from './data';
import { DragSourceRenderer } from './dragSourceRenderer_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

var rowClassRules = {
    'red-row': 'data.color == "Red"',
    'green-row': 'data.color == "Green"',
    'blue-row': 'data.color == "Blue"',
};

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 80,
        filter: true,
    },
    rowClassRules: rowClassRules,
    rowData: getData(),
    rowDragManaged: true,
    columnDefs: [
        { cellRenderer: DragSourceRenderer, minWidth: 100 },
        { field: 'id' },
        { field: 'color' },
        { field: 'value1' },
        { field: 'value2' },
    ],
};

function onDragOver(event: any) {
    var types = event.dataTransfer.types;

    var dragSupported = types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
    }

    event.preventDefault();
}

function onDrop(event: any) {
    event.preventDefault();

    var textData = event.dataTransfer.getData('text/plain');
    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = textData;

    var eJsonDisplay = document.querySelector('#eJsonDisplay')!;
    eJsonDisplay.appendChild(eJsonRow);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

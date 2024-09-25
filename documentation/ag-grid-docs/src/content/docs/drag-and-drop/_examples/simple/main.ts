import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { valueGetter: "'Drag'", dndSource: true },
    { field: 'id' },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 80,
        filter: true,
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    rowData: getData(),
    rowDragManaged: true,
    columnDefs: columnDefs,
};

function onDragOver(event: any) {
    var dragSupported = event.dataTransfer.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
    }

    event.preventDefault();
}

function onDrop(event: any) {
    var jsonData = event.dataTransfer.getData('application/json');

    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = jsonData;

    var eJsonDisplay = document.querySelector('#eJsonDisplay')!;

    eJsonDisplay.appendChild(eJsonRow);
    event.preventDefault();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

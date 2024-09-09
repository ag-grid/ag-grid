import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { DndSourceOnRowDragParams, GridApi, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
    columnDefs: [
        {
            valueGetter: "'Drag'",
            dndSource: true,
            dndSourceOnRowDrag: onRowDrag,
        },
        { field: 'id' },
        { field: 'color' },
        { field: 'value1' },
        { field: 'value2' },
    ],
};

function onDragOver(event: any) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
    }

    event.preventDefault();
}

function onDrop(event: any) {
    event.preventDefault();
    var jsonData = event.dataTransfer.getData('application/json');

    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = jsonData;

    var eJsonDisplay = document.querySelector('#eJsonDisplay')!;
    eJsonDisplay.appendChild(eJsonRow);
}

function onRowDrag(params: DndSourceOnRowDragParams) {
    // create the data that we want to drag
    var rowNode = params.rowNode;
    var e = params.dragEvent;
    var jsonObject = {
        grid: 'GRID_001',
        operation: 'Drag on Column',
        rowId: rowNode.data.id,
        selected: rowNode.isSelected(),
    };
    var jsonData = JSON.stringify(jsonObject);

    e.dataTransfer!.setData('application/json', jsonData);
    e.dataTransfer!.setData('text/plain', jsonData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

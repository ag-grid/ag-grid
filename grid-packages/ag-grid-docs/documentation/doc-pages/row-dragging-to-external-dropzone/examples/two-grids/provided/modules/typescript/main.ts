import { ModuleRegistry, ColDef, Grid, GridOptions, GridReadyEvent, RowDropZoneParams, GetRowIdParams } from "@ag-grid-community/core";
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

var rowIdSequence = 100;

var leftColumnDefs: ColDef[] = [
    { field: "id", rowDrag: true },
    { field: "color" },
    { field: "value1" },
    { field: "value2" }
];

var rightColumnDefs: ColDef[] = [
    { field: "id", rowDrag: true },
    { field: "color" },
    { field: "value1" },
    { field: "value2" }
];

var leftGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => { return params.data.id },
    rowData: createLeftRowData(),
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: (params) => {
        addBinZone(params);
        addGridDropZone(params, 'Right');
    }
};

var rightGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        "red-row": 'data.color == "Red"',
        "green-row": 'data.color == "Green"',
        "blue-row": 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => { return params.data.id },
    rowData: [],
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: rightColumnDefs,
    animateRows: true,
    onGridReady: (params) => {
        addBinZone(params);
        addGridDropZone(params, 'Left');
    }
};

function createLeftRowData() {
    return ['Red', 'Green', 'Blue'].map(function (color) {
        return createDataItem(color);
    });
}

function createDataItem(color: string) {
    return {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100)
    };
}

function addRecordToGrid(side: string, data: any) {
    // if data missing or data has no it, do nothing
    if (!data || data.id == null) { return; }

    var api = side === 'left' ? leftGridOptions.api : rightGridOptions.api,
        // do nothing if row is already in the grid, otherwise we would have duplicates
        rowAlreadyInGrid = !!api!.getRowNode(data.id),
        transaction;

    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    transaction = {
        add: [data]
    };

    api!.applyTransaction(transaction);
}

function onFactoryButtonClick(e: any) {
    var button = e.currentTarget,
        buttonColor = button.getAttribute('data-color'),
        side = button.getAttribute('data-side'),
        data = createDataItem(buttonColor);

    addRecordToGrid(side, data);
}

function binDrop(data: any) {
    // if data missing or data has no id, do nothing
    if (!data || data.id == null) { return; }

    var transaction = {
        remove: [data]
    };

    [leftGridOptions, rightGridOptions].forEach(function (option) {
        var rowsInGrid = !!option.api!.getRowNode(data.id);

        if (rowsInGrid) {
            option.api!.applyTransaction(transaction);
        }
    });
}

function addBinZone(params: GridReadyEvent) {
    var eBin = document.querySelector('.bin') as any,
        icon = eBin.querySelector('i'),
        dropZone: RowDropZoneParams = {
            getContainer: () => { return eBin; },
            onDragEnter: () => {
                eBin.style.color = 'blue';
                icon.style.transform = 'scale(1.5)';
            },
            onDragLeave: () => {
                eBin.style.color = 'black';
                icon.style.transform = 'scale(1)';
            },
            onDragStop: (dragStopParams) => {
                binDrop(dragStopParams.node.data);
                eBin.style.color = 'black';
                icon.style.transform = 'scale(1)';
            }
        };

    params.api.addRowDropZone(dropZone);
}

function addGridDropZone(params: GridReadyEvent, side: string) {
    var grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!,
        dropZone: RowDropZoneParams = {
            getContainer: () => { return grid; },
            onDragStop: (params) => {
                addRecordToGrid(side.toLowerCase(), params.node.data);
            }
        };

    params.api.addRowDropZone(dropZone);
}

function loadGrid(side: string) {
    var grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;
    new Grid(grid, side === 'Left' ? leftGridOptions : rightGridOptions);
}

var buttons = document.querySelectorAll('button.factory');

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', onFactoryButtonClick);
}

loadGrid('Left');
loadGrid('Right');

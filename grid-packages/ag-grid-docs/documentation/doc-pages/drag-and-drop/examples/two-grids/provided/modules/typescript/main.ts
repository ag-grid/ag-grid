import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef, ColGroupDef, Grid, GridOptions, GetRowIdParams } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])
var rowIdSequence = 100;

var leftColumnDefs: ColDef[] = [
    { field: 'id', dndSource: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' }
];

var rightColumnDefs: ColDef[] = [
    { field: 'id', dndSource: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' }
];

var leftGridOptions: GridOptions = {
    defaultColDef: {
        width: 80,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => { return params.data.id; },
    rowData: createLeftRowData(),
    rowDragManaged: true,
    columnDefs: leftColumnDefs,
    animateRows: true
};

var rightGridOptions: GridOptions = {
    defaultColDef: {
        width: 80,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => { return params.data.id; },
    rowData: [],
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
    animateRows: true
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

function binDragOver(event: any) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
    }
}

function binDrop(event: any) {
    event.preventDefault();

    var jsonData = event.dataTransfer.getData('application/json');
    var data = JSON.parse(jsonData);

    // if data missing or data has no id, do nothing
    if (!data || data.id == null) { return; }

    var transaction = {
        remove: [data]
    };

    var rowIsInLeftGrid = !!leftGridOptions.api!.getRowNode(data.id);
    if (rowIsInLeftGrid) {
        leftGridOptions.api!.applyTransaction(transaction);
    }

    var rowIsInRightGrid = !!rightGridOptions.api!.getRowNode(data.id);
    if (rowIsInRightGrid) {
        rightGridOptions.api!.applyTransaction(transaction);
    }
}

function dragStart(event: any, color: string) {
    var newItem = createDataItem(color);
    var jsonData = JSON.stringify(newItem);

    event.dataTransfer.setData('application/json', jsonData);
}

function gridDragOver(event: any) {
    var dragSupported = event.dataTransfer.types.length;

    if (dragSupported) {
        event.dataTransfer.dropEffect = 'copy';
        event.preventDefault();
    }

}

function gridDrop(event: any, grid: string) {
    event.preventDefault();

    var jsonData = event.dataTransfer.getData('application/json');
    var data = JSON.parse(jsonData);

    // if data missing or data has no it, do nothing
    if (!data || data.id == null) { return; }

    var api = grid == 'left' ? leftGridOptions.api! : rightGridOptions.api!;

    // do nothing if row is already in the grid, otherwise we would have duplicates
    var rowAlreadyInGrid = !!api!.getRowNode(data.id);
    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    var transaction = {
        add: [data]
    };
    api.applyTransaction(transaction);
}


var leftGridDiv = document.querySelector<HTMLElement>('#eLeftGrid')!;
new Grid(leftGridDiv, leftGridOptions);

var rightGridDiv = document.querySelector<HTMLElement>('#eRightGrid')!;
new Grid(rightGridDiv, rightGridOptions);

if (typeof window !== 'undefined') {
    // Attach external event handlers to window so they can be called from index.html
    (<any>window).binDragOver = binDragOver;
    (<any>window).binDrop = binDrop;
    (<any>window).dragStart = dragStart;
    (<any>window).gridDragOver = gridDragOver;
    (<any>window).gridDrop = gridDrop;
}

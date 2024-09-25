import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
    RowDropZoneParams,
    createGrid,
} from 'ag-grid-community';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

var rowIdSequence = 100;

var leftColumnDefs: ColDef[] = [
    { field: 'id', rowDrag: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' },
];

var rightColumnDefs: ColDef[] = [
    { field: 'id', rowDrag: true },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' },
];
var leftApi: GridApi;
var leftGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => {
        return String(params.data.id);
    },
    rowData: createRowBlock(2),
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    onGridReady: (params) => {
        addBinZone(params);
        addGridDropZone(params, 'Right');
    },
};
var rightApi: GridApi;
var rightGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    rowClassRules: {
        'red-row': 'data.color == "Red"',
        'green-row': 'data.color == "Green"',
        'blue-row': 'data.color == "Blue"',
    },
    getRowId: (params: GetRowIdParams) => {
        return String(params.data.id);
    },
    rowData: createRowBlock(2),
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: rightColumnDefs,
    onGridReady: (params) => {
        addBinZone(params);
        addGridDropZone(params, 'Left');
    },
};

function createRowBlock(blocks: number) {
    blocks = blocks || 1;

    var output: any[] = [];

    for (var i = 0; i < blocks; i++) {
        output = output.concat(
            ['Red', 'Green', 'Blue'].map(function (color) {
                return createDataItem(color);
            })
        );
    }

    return output;
}

function createDataItem(color: string) {
    return {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100),
    };
}

function addRecordToGrid(side: string, data: any) {
    // if data missing or data has no it, do nothing
    if (!data || data.id == null) {
        return;
    }

    var gridApi = side === 'left' ? leftApi : rightApi,
        // do nothing if row is already in the grid, otherwise we would have duplicates
        rowAlreadyInGrid = !!gridApi!.getRowNode(data.id),
        transaction;

    if (rowAlreadyInGrid) {
        console.log('not adding row to avoid duplicates in the grid');
        return;
    }

    transaction = {
        add: [data],
    };

    gridApi!.applyTransaction(transaction);
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
    if (!data || data.id == null) {
        return;
    }

    var transaction = {
        remove: [data],
    };

    [leftApi, rightApi].forEach((gridApi) => {
        var rowsInGrid = !!gridApi!.getRowNode(data.id);

        if (rowsInGrid) {
            gridApi!.applyTransaction(transaction);
        }
    });
}

function addBinZone(params: GridReadyEvent) {
    var eBin = document.querySelector('.bin') as any,
        icon = eBin.querySelector('i'),
        dropZone: RowDropZoneParams = {
            getContainer: () => {
                return eBin;
            },
            onDragEnter: () => {
                eBin.style.color = 'blue';
                icon.style.transform = 'scale(1.5)';
            },
            onDragLeave: () => {
                eBin.style = '';
                icon.style.transform = 'scale(1)';
            },
            onDragStop: (params) => {
                binDrop(params.node.data);
                eBin.style = '';
                icon.style.transform = 'scale(1)';
            },
        };

    params.api.addRowDropZone(dropZone);
}

function addGridDropZone(params: GridReadyEvent, side: string) {
    var gridApi = (side === 'Left' ? leftApi : rightApi)!;
    var dropZone = gridApi.getRowDropZoneParams();

    params.api.addRowDropZone(dropZone);
}

function loadGrid(side: string) {
    var grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;
    if (side === 'Left') {
        leftApi = createGrid(grid, leftGridOptions);
    } else {
        rightApi = createGrid(grid, rightGridOptions);
    }
}

var buttons = document.querySelectorAll('button.factory');

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', onFactoryButtonClick);
}

loadGrid('Left');
loadGrid('Right');

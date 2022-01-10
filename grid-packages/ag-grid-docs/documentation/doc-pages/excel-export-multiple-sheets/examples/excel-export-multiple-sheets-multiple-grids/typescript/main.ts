import { ColDef, GridOptions, GridReadyEvent } from "@ag-grid-community/core";

var leftColumnDefs: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function (params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" }
];

var rightColumnDefs: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function (params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: function (params) {
            var button = document.createElement('i');

            button.addEventListener('click', function () {
                params.api.applyTransaction({ remove: [params.node.data] });
            });

            button.classList.add('far');
            button.classList.add('fa-trash-alt');
            button.style.cursor = 'pointer';

            return button;
        }
    }
];

var leftGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowSelection: 'multiple',
    rowDragMultiRow: true,
    getRowNodeId: function (data) {
        return data.athlete;
    },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: function (params) {
        addGridDropZone(params);
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
    getRowNodeId: function (data) {
        return data.athlete;
    },
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
    animateRows: true
};

function addGridDropZone(params: GridReadyEvent) {
    var dropZoneParams = rightGridOptions.api!.getRowDropZoneParams({
        onDragStop: function (params) {
            var nodes = params.nodes;

            leftGridOptions.api!.applyTransaction({
                remove: nodes.map(function (node) {
                    return node.data;
                })
            });
        }
    });

    params.api.addRowDropZone(dropZoneParams);
}

function loadGrid(options: GridOptions, side: string, data: any[]) {
    var grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;

    if (options && options.api) {
        options.api.destroy();
    }

    options.rowData = data;
    new agGrid.Grid(grid, options);
}

function loadGrids() {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            var athletes: any[] = [];
            var i = 0;

            while (athletes.length < 20 && i < data.length) {
                var pos = i++;
                if (athletes.some(function (rec) {
                    return rec.athlete === data[pos].athlete;
                })) {
                    continue;
                }
                athletes.push(data[pos]);
            }

            loadGrid(leftGridOptions, 'Left', athletes.slice(0, athletes.length / 2));
            loadGrid(rightGridOptions, 'Right', athletes.slice(athletes.length / 2));
        });
}

function onExcelExport() {
    var spreadsheets = [];

    spreadsheets.push(
        leftGridOptions.api!.getSheetDataForExcel({ sheetName: 'Athletes' })!,
        rightGridOptions.api!.getSheetDataForExcel({ sheetName: 'Selected Athletes' })!
    );

    // could be leftGridOptions or rightGridOptions
    leftGridOptions.api!.exportMultipleSheetsAsExcel({
        data: spreadsheets,
        fileName: 'ag-grid.xlsx'
    });
}


var resetBtn = document.querySelector('button.reset')!;
var exportBtn = document.querySelector('button.excel')!;

resetBtn.addEventListener('click', function () {
    loadGrids();
});

exportBtn.addEventListener('click', function () {
    onExcelExport();
});

loadGrids();


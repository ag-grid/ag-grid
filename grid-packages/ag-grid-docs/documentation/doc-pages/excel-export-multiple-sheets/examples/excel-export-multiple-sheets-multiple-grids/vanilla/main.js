class SportRenderer {
    eGui;

    init(params) {
        this.eGui = document.createElement('i');

        this.eGui.addEventListener('click', function () {
            params.api.applyTransaction({remove: [params.node.data]});
        });

        this.eGui.classList.add('far', 'fa-trash-alt');
        this.eGui.style.cursor = 'pointer';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }
}

const leftColumnDefs = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function (params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    {field: "athlete"},
    {field: "sport"}
];

const rightColumnDefs = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function (params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    {field: "athlete"},
    {field: "sport"},
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: SportRenderer
    }
];

const leftGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowSelection: 'multiple',
    rowDragMultiRow: true,
    getRowId: function (params) {
        return params.data.athlete;
    },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: function (params) {
        addGridDropZone(params);
    }
};

const rightGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    getRowId: function (params) {
        return params.data.athlete;
    },
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
    animateRows: true
};

function addGridDropZone(params) {
    const dropZoneParams = rightGridOptions.api.getRowDropZoneParams({
        onDragStop: function (params) {
            const nodes = params.nodes;

            leftGridOptions.api.applyTransaction({
                remove: nodes.map(function (node) {
                    return node.data;
                })
            });
        }
    });

    params.api.addRowDropZone(dropZoneParams);
}

function loadGrid(options, side, data) {
    const grid = document.querySelector('#e' + side + 'Grid');

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
            const athletes = [];
            let i = 0;

            while (athletes.length < 20 && i < data.length) {
                let pos = i++;
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
    const spreadsheets = [];

    spreadsheets.push(
        leftGridOptions.api.getSheetDataForExcel({sheetName: 'Athletes'}),
        rightGridOptions.api.getSheetDataForExcel({sheetName: 'Selected Athletes'})
    );

    // could be leftGridOptions or rightGridOptions
    leftGridOptions.api.exportMultipleSheetsAsExcel({
        data: spreadsheets,
        fileName: 'ag-grid.xlsx'
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const resetBtn = document.querySelector('button.reset');
    const exportBtn = document.querySelector('button.excel');

    resetBtn.addEventListener('click', function () {
        loadGrids();
    });

    exportBtn.addEventListener('click', function () {
        onExcelExport();
    });

    loadGrids();
});


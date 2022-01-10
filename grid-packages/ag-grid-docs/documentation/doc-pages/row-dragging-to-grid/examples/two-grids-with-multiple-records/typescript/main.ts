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
    {
        colId: 'checkbox',
        maxWidth: 50,
        checkboxSelection: true,
        suppressMenu: true,
        headerCheckboxSelection: true
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
    suppressRowClickSelection: true,
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
            var deselectCheck = (document.querySelector('input#deselect') as HTMLInputElement).checked;
            var moveCheck = (document.querySelector('input#move') as HTMLInputElement).checked;
            var nodes = params.nodes;

            if (moveCheck) {
                leftGridOptions.api!.applyTransaction({
                    remove: nodes.map(function (node) {
                        return node.data;
                    })
                });
            } else if (deselectCheck) {
                nodes.forEach(function (node) {
                    node.setSelected(false);
                });
            }
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

function resetInputs() {
    var inputs = document.querySelectorAll('.example-toolbar input') as NodeListOf<HTMLInputElement>;
    var checkbox = inputs[inputs.length - 1];

    if (!checkbox.checked) {
        checkbox.click();
    }

    inputs[0].checked = true;
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

            loadGrid(leftGridOptions, 'Left', athletes);
            loadGrid(rightGridOptions, 'Right', []);
        });
}

var resetBtn = document.querySelector('button.reset')!;
var checkboxToggle = document.querySelector('#toggleCheck') as HTMLInputElement;

resetBtn.addEventListener('click', function () {
    resetInputs();
    loadGrids();
});

checkboxToggle.addEventListener('change', function () {
    leftGridOptions.columnApi!.setColumnVisible('checkbox', checkboxToggle.checked);
    leftGridOptions.api!.setSuppressRowClickSelection(checkboxToggle.checked);
});

loadGrids();


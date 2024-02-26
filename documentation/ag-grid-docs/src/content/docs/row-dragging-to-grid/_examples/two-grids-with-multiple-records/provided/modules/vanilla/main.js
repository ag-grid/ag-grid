class SportRenderer {
    eGui;

    init(params) {
        this.eGui = document.createElement('i');

        this.eGui.addEventListener('click', function () {
            params.api.applyTransaction({ remove: [params.node.data] });
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
        suppressHeaderMenuButton: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    {
        colId: 'checkbox',
        maxWidth: 50,
        checkboxSelection: true,
        suppressHeaderMenuButton: true,
        headerCheckboxSelection: true
    },
    { field: "athlete" },
    { field: "sport" }
];

const rightColumnDefs = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressHeaderMenuButton: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressHeaderMenuButton: true,
        maxWidth: 50,
        cellRenderer: SportRenderer
    }
];
let leftApi;
const leftGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    rowSelection: 'multiple',
    rowDragMultiRow: true,
    suppressRowClickSelection: true,
    getRowId: (params) => {
        return params.data.athlete;
    },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    onGridReady: (params) => {
        addGridDropZone(params);
    }
};
let rightApi;
const rightGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    getRowId: (params) => {
        return params.data.athlete;
    },
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
};

function addGridDropZone(params) {
    const dropZoneParams = rightApi.getRowDropZoneParams({
        onDragStop: (params) => {
            const deselectCheck = document.querySelector('input#deselect').checked;
            const moveCheck = document.querySelector('input#move').checked;
            const nodes = params.nodes;

            if (moveCheck) {
                leftApi.applyTransaction({
                    remove: nodes.map(function (node) {
                        return node.data;
                    })
                });
            } else if (deselectCheck) {
                leftApi.setNodesSelected({ nodes, newValue: false });
            }
        }
    });

    params.api.addRowDropZone(dropZoneParams);
}

function loadGrid(options, oldApi, side, data) {
    const grid = document.querySelector('#e' + side + 'Grid');

    oldApi?.destroy();
    options.rowData = data;
    return agGrid.createGrid(grid, options);
}

function resetInputs() {
    const inputs = document.querySelectorAll('.example-toolbar input');
    const checkbox = inputs[inputs.length - 1];

    if (!checkbox.checked) {
        checkbox.click();
    }

    inputs[0].checked = true;
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

            leftApi = loadGrid(leftGridOptions, leftApi, 'Left', athletes);
            rightApi = loadGrid(rightGridOptions, rightApi, 'Right', []);
        });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const resetBtn = document.querySelector('button.reset');
    const checkboxToggle = document.querySelector('#toggleCheck');

    resetBtn.addEventListener('click', function () {
        resetInputs();
        loadGrids();
    });

    checkboxToggle.addEventListener('change', function () {
        leftApi.setColumnsVisible(['checkbox'], checkboxToggle.checked);
        leftApi.setGridOption('suppressRowClickSelection', checkboxToggle.checked);
    });

    loadGrids();
});


import { ColDef, Grid, GridOptions, GridReadyEvent, ICellRendererComp, ICellRendererParams } from "ag-grid-community";
import 'ag-grid-community/dist/styles/ag-grid.css';
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

class SportRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
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

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

const leftColumnDefs: ColDef[] = [
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

const rightColumnDefs: ColDef[] = [
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
        cellRenderer: SportRenderer
    }
];

const leftGridOptions: GridOptions = {
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

const rightGridOptions: GridOptions = {
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

function addGridDropZone(params: GridReadyEvent) {
    const dropZoneParams = rightGridOptions.api!.getRowDropZoneParams({
        onDragStop: function (params) {
            const deselectCheck = (document.querySelector('input#deselect') as HTMLInputElement).checked;
            const moveCheck = (document.querySelector('input#move') as HTMLInputElement).checked;
            const nodes = params.nodes;

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
    const grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;

    if (options && options.api) {
        options.api.destroy();
    }

    options.rowData = data;
    new Grid(grid, options);
}

function resetInputs() {
    const inputs = document.querySelectorAll('.example-toolbar input') as NodeListOf<HTMLInputElement>;
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
            const athletes: any[] = [];
            let i = 0;

            while (athletes.length < 20 && i < data.length) {
                const pos = i++;
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

const resetBtn = document.querySelector('button.reset')!;
const checkboxToggle = document.querySelector('#toggleCheck') as HTMLInputElement;

resetBtn.addEventListener('click', function () {
    resetInputs();
    loadGrids();
});

checkboxToggle.addEventListener('change', function () {
    leftGridOptions.columnApi!.setColumnVisible('checkbox', checkboxToggle.checked);
    leftGridOptions.api!.setSuppressRowClickSelection(checkboxToggle.checked);
});

loadGrids();


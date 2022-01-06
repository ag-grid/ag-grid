import {ColDef, GridOptions, ICellRendererParams, RowSpanParams} from '@ag-grid-community/core'

function rowSpan(params: RowSpanParams) {
    if (params.data.show) {
        return 4
    } else {
        return 1
    }
}

class ShowCellRenderer {
    ui: any;

    init(params: ICellRendererParams) {
        const cellBlank = !params.value;
        if (cellBlank) {
            return null
        }

        this.ui = document.createElement('div')
        this.ui.innerHTML =
            '<div class="show-name">' +
            params.value.name +
            '' +
            '</div>' +
            '<div class="show-presenter">' +
            params.value.presenter +
            '</div>'
    }

    getGui() {
        return this.ui;
    }
}

const columnDefs: ColDef[] = [
    {field: 'localTime'},
    {
        field: 'show',
        cellRendererComp: ShowCellRenderer,
        rowSpan: rowSpan,
        cellClassRules: {
            'show-cell': 'value !== undefined',
        },
        width: 200,
    },
    {field: 'a'},
    {field: 'b'},
    {field: 'c'},
    {field: 'd'},
    {field: 'e'},
]

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        resizable: true,
        width: 170,
    },
    rowData: getData(),
    suppressRowTransform: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions)
})

import {Grid, GridOptions, ICellRenderer, ICellRendererParams} from '@ag-grid-community/core'

let count = 0

class SlowCellRenderer implements ICellRenderer {

    private eGui!: HTMLElement;

    init(p: ICellRendererParams) {
        const start = new Date().valueOf();
        while ((new Date().valueOf() - start) < 15) {
        this.eGui = document.createElement('span');
        }
        this.eGui = document.createElement('span');
        this.eGui.innerHTML = `${++count}`;
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    refresh(): boolean { return false; }
}

const gridOptions: GridOptions = {
    columnDefs: [
        {field: '1'},
        {field: '2'},
        {field: '3'},
        {field: '4'},
        {field: '5'},
        {field: '6'},
        {field: '7'},
        {field: '8'},
        {field: '9'},
        {field: '10'},
        {field: '11'},
        {field: '12'},
        {field: '13'},
        {field: '14'},
        {field: '15'},
        {field: '16'},
        {field: '17'},
        {field: '18'},
        {field: '19'},
        {field: '20'},
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 80,
        cellRenderer: SlowCellRenderer
    },
    rowData: getRowData(),
    rowSelection: 'single',
    rowBuffer: 0,
}

function getRowData() {
    // 1000 blank rows for the grid
    return Array.apply(null, Array(1000))
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions)
})

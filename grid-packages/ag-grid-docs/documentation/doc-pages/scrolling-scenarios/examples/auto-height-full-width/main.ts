import { ColGroupDef, Grid, GridOptions, ICellRendererParams, IsFullWidthRowParams } from '@ag-grid-community/core';

const columnDefs: ColGroupDef[] = [
    {
        headerName: 'Core',
        children: [
            { headerName: 'ID', field: 'id' },
            { headerName: 'Make', field: 'make' },
            { headerName: 'Price', field: 'price', filter: 'number' },
        ],
    },
    {
        headerName: 'Extra',
        children: [
            { headerName: 'Val 1', field: 'val1', filter: 'number', pinned: 'left' },
            { headerName: 'Val 2', field: 'val2', filter: 'number', pinned: 'left' },
            { headerName: 'Val 3', field: 'val3', filter: 'number' },
            { headerName: 'Val 4', field: 'val4', filter: 'number' },
            { headerName: 'Val 5', field: 'val5', filter: 'number' },
            { headerName: 'Val 6', field: 'val6', filter: 'number' },
            { headerName: 'Val 7', field: 'val7', filter: 'number' },
            { headerName: 'Val 8', field: 'val8', filter: 'number' },
            { headerName: 'Val 9', field: 'val9', filter: 'number', pinned: 'right' },
            {
                headerName: 'Val 10',
                field: 'val10',
                filter: 'number',
                pinned: 'right',
            },
        ],
    },
]

const makes = ['Toyota', 'Ford', 'BMW', 'Phantom', 'Porsche'];

const gridOptions: GridOptions = {
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        width: 100,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
    },
    rowData: createRowData(),
    isFullWidthRow: isFullWidthRow,
    fullWidthCellRenderer: fullWidthCellRenderer,
    pagination: true,
    paginationPageSize: 10,
    columnDefs: columnDefs,
    domLayout: 'autoHeight',
}

function isFullWidthRow(params: IsFullWidthRowParams): boolean {
    return params.rowNode.data.fullWidth
}

function fullWidthCellRenderer(params: ICellRendererParams) {
    // pinned rows will have node.floating set to either 'top' or 'bottom' - see docs for floating
    let cssClass;
    let message;

    if (params.node.rowPinned) {
        cssClass = 'example-full-width-floating-row'
        message = 'Floating full width row at index ' + params.rowIndex
    } else {
        cssClass = 'example-full-width-row'
        message = 'Normal full width row at index' + params.rowIndex
    }

    const eDiv = document.createElement('div');
    eDiv.innerHTML = `<div class="${cssClass}"><button>Click</button> ${message}</div>`

    const eButton = eDiv.querySelector('button')!;
    eButton.addEventListener('click', function () {
        alert('button clicked')
    })

    return eDiv
}

function createRow(index: number) {
    return {
        id: 'D' + (1000 + index),
        make: makes[Math.floor(Math.random() * makes.length)],
        price: Math.floor(Math.random() * 100000),
        // every third row is full width
        fullWidth: index % 3 === 0,
        val1: Math.floor(Math.random() * 1000),
        val2: Math.floor(Math.random() * 1000),
        val3: Math.floor(Math.random() * 1000),
        val4: Math.floor(Math.random() * 1000),
        val5: Math.floor(Math.random() * 1000),
        val6: Math.floor(Math.random() * 1000),
        val7: Math.floor(Math.random() * 1000),
        val8: Math.floor(Math.random() * 1000),
        val9: Math.floor(Math.random() * 1000),
        val10: Math.floor(Math.random() * 1000),
    }
}

function createRowData() {
    const rowData = [];
    for (let i = 0; i < 15; i++) {
        rowData.push(createRow(i))
    }
    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions)
})

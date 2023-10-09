import { ColDef, GridApi, createGrid, GridOptions, ValueFormatterParams } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
    // this row just shows the row index, doesn't use any data from the row
    {
        headerName: '#',
        width: 50,
        valueFormatter: (params: ValueFormatterParams) => {
            return `${parseInt(params.node!.id!) + 1}`;
        },
    },
    { headerName: 'Athlete', field: 'athlete', width: 150 },
    { headerName: 'Age', field: 'age', width: 90 },
    { headerName: 'Country', field: 'country', width: 120 },
    { headerName: 'Year', field: 'year', width: 90 },
    { headerName: 'Date', field: 'date', width: 110 },
    { headerName: 'Sport', field: 'sport', width: 110 },
    { headerName: 'Gold', field: 'gold', width: 100 },
    { headerName: 'Silver', field: 'silver', width: 100 },
    { headerName: 'Bronze', field: 'bronze', width: 100 },
    { headerName: 'Total', field: 'total', width: 100 },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        resizable: true,
        filter: true,
    },
    // debug: true,
    rowSelection: 'multiple',
    paginationPageSize: 500,
    columnDefs: columnDefs,
    pagination: true,
    suppressPaginationPanel: true,
    suppressScrollOnNewData: true,
    onPaginationChanged: onPaginationChanged,
}

function setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text
}

function onPaginationChanged() {
    console.log('onPaginationPageLoaded')

    // Workaround for bug in events order
    if (api!) {
        setText('#lbLastPageFound', api!.paginationIsLastPageFound())
        setText('#lbPageSize', api!.paginationGetPageSize())
        // we +1 to current page, as pages are zero based
        setText('#lbCurrentPage', api!.paginationGetCurrentPage() + 1)
        setText('#lbTotalPages', api!.paginationGetTotalPages())

        setLastButtonDisabled(!api!.paginationIsLastPageFound())
    }
}

function setLastButtonDisabled(disabled: boolean) {
    (document.querySelector('#btLast') as any).disabled = disabled
}

function onBtFirst() {
    api!.paginationGoToFirstPage()
}

function onBtLast() {
    api!.paginationGoToLastPage()
}

function onBtNext() {
    api!.paginationGoToNextPage()
}

function onBtPrevious() {
    api!.paginationGoToPreviousPage()
}

function onBtPageFive() {
    // we say page 4, as the first page is zero
    api!.paginationGoToPage(4)
}

function onBtPageFifty() {
    // we say page 49, as the first page is zero
    api!.paginationGoToPage(49)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    api = createGrid(gridDiv, gridOptions);;

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then((data: IOlympicData[]) => api!.setRowData(data))
})

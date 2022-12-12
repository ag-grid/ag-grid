import {
    ColDef,
    Grid,
    GridOptions,
    ICellRendererParams,
    IDatasource,
    IGetRowsParams,
    RowClassParams,
    RowStyle,
    ValueFormatterParams,
    GetRowIdParams,
    GridReadyEvent,
    FirstDataRenderedEvent
} from '@ag-grid-community/core'

const valueFormatter = function (params: ValueFormatterParams) {
    if (typeof params.value === 'number') {
        return '£' + params.value.toLocaleString()
    } else {
        return params.value
    }
};
const columnDefs: ColDef[] = [
    {
        headerName: 'Item ID',
        field: 'id',
        valueGetter: 'node.id',
        cellRenderer: (params: ICellRendererParams) => {
            if (params.value !== undefined) {
                return params.value
            } else {
                return '<img src="https://www.ag-grid.com/example-assets/loading.gif">'
            }
        },
    },
    { field: 'make' },
    { field: 'model' },
    {
        field: 'price',
        valueFormatter: valueFormatter,
    },
]

const datasource: IDatasource = {
    rowCount: undefined, // behave as infinite scroll
    getRows: (params: IGetRowsParams) => {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow)
        // At this point in your code, you would call the server.
        // To make the demo look real, wait for 500ms before returning
        setTimeout(function () {
            // take a slice of the total rows
            const rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
            // make a copy of each row - this is what would happen if taking data from server
            for (let i = 0; i < rowsThisPage.length; i++) {
                const item = rowsThisPage[i];
                // this is a trick to copy an object
                const itemCopy = JSON.parse(JSON.stringify(item));
                rowsThisPage[i] = itemCopy
            }
            // if on or after the last page, work out the last row.
            let lastRow = -1;
            if (allOfTheData.length <= params.endRow) {
                lastRow = allOfTheData.length
            }
            // call the success callback
            params.successCallback(rowsThisPage, lastRow)
        }, 500)
    },
};

const gridOptions: GridOptions = {
    defaultColDef: {
        resizable: true,
    },
    rowSelection: 'multiple',
    columnDefs: columnDefs,
    rowModelType: 'infinite',
    datasource: datasource,

    maxBlocksInCache: 2,
    infiniteInitialRowCount: 500,
    maxConcurrentDatasourceRequests: 2,

    getRowId: (params: GetRowIdParams) => {
        return params.data.id.toString()
    },

    onGridReady: (params: GridReadyEvent) => {
        sequenceId = 1
        allOfTheData = []
        for (let i = 0; i < 1000; i++) {
            allOfTheData.push(createRowData(sequenceId++))
        }
    },

    onFirstDataRendered: (params: FirstDataRenderedEvent) => {
        params.api.sizeColumnsToFit()
    },

    getRowStyle: (params: RowClassParams): RowStyle | undefined => {
        if (params.data && params.data.make === 'Honda') {
            return {
                fontWeight: 'bold',
            }
        } else {
            return undefined
        }
    },
}

// this counter is used to give id's to the rows
var sequenceId = 0
var allOfTheData: any[] = []

function createRowData(id: number) {
    const makes = ['Toyota', 'Ford', 'Porsche', 'Chevy', 'Honda', 'Nissan'];
    const models = [
        'Cruze',
        'Celica',
        'Mondeo',
        'Boxster',
        'Genesis',
        'Accord',
        'Taurus',
    ];
    return {
        id: id,
        make: makes[id % makes.length],
        model: models[id % models.length],
        price: 72000,
    }
}

function insertItemsAt2AndRefresh(count: number) {
    insertItemsAt2(count)

    // if the data has stopped looking for the last row, then we need to adjust the
    // row count to allow for the extra data, otherwise the grid will not allow scrolling
    // to the last row. eg if we have 1000 rows, scroll all the way to the bottom (so
    // maxRowFound=true), and then add 5 rows, the rowCount needs to be adjusted
    // to 1005, so grid can scroll to the end. the grid does NOT do this for you in the
    // refreshInfiniteCache() method, as this would be assuming you want to do it which
    // is not true, maybe the row count is constant and you just want to refresh the details.
    const maxRowFound = gridOptions.api!.isLastRowIndexKnown();
    if (maxRowFound) {
        const rowCount = gridOptions.api!.getInfiniteRowCount() || 0;
        gridOptions.api!.setRowCount(rowCount + count)
    }

    // get grid to refresh the data
    gridOptions.api!.refreshInfiniteCache()
}

function insertItemsAt2(count: number) {
    const newDataItems = [];
    for (let i = 0; i < count; i++) {
        const newItem = createRowData(sequenceId++);
        allOfTheData.splice(2, 0, newItem)
        newDataItems.push(newItem)
    }
    return newDataItems
}

function removeItem(start: number, limit: number) {
    allOfTheData.splice(start, limit)
    gridOptions.api!.refreshInfiniteCache()
}

function refreshCache() {
    gridOptions.api!.refreshInfiniteCache()
}

function purgeCache() {
    gridOptions.api!.purgeInfiniteCache()
}

function setRowCountTo200() {
    gridOptions.api!.setRowCount(200, false)
}

function rowsAndMaxFound() {
    console.log(
        'getInfiniteRowCount() => ' + gridOptions.api!.getInfiniteRowCount()
    )
    console.log(
        'isLastRowIndexKnown() => ' + gridOptions.api!.isLastRowIndexKnown()
    )
}

// function just gives new prices to the row data, it does not update the grid
function setPricesHigh() {
    allOfTheData.forEach(function (dataItem) {
        dataItem.price = Math.round(55500 + 400 * (0.5 + Math.random()))
    })
}

function setPricesLow() {
    allOfTheData.forEach(function (dataItem) {
        dataItem.price = Math.round(1000 + 100 * (0.5 + Math.random()))
    })
}

function jumpTo500() {
    // first up, need to make sure the grid is actually showing 500 or more rows
    if ((gridOptions.api!.getInfiniteRowCount() || 0) < 501) {
        gridOptions.api!.setRowCount(501, false)
    }
    // next, we can jump to the row
    gridOptions.api!.ensureIndexVisible(500)
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions)
})

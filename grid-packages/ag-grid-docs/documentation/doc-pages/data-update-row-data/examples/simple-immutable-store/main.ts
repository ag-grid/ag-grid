import { ColumnApi, Grid, GridOptions, GetRowIdParams } from '@ag-grid-community/core'

function getInitialData() {
    const data = [];
    for (let i = 0; i < 5; i++) {
        data.push(createItem())
    }

    return data
}

let immutableStore: any[] = [];

function addFiveItems(append: boolean) {
    const newStore = immutableStore.slice();
    for (let i = 0; i < 5; i++) {
        const newItem = createItem();
        if (append) {
            newStore.push(newItem)
        } else {
            newStore.splice(0, 0, newItem)
        }
    }
    immutableStore = newStore
    gridOptions.api!.setRowData(immutableStore)
}

function removeSelected() {
    const selectedRowNodes = gridOptions.api!.getSelectedNodes();
    const selectedIds = selectedRowNodes.map(function (rowNode) {
        return rowNode.id
    });
    immutableStore = immutableStore.filter(function (dataItem) {
        return selectedIds.indexOf(dataItem.symbol) < 0
    })
    gridOptions.api!.setRowData(immutableStore)
}

function setSelectedToGroup(newGroup: string) {
    const selectedRowNodes = gridOptions.api!.getSelectedNodes();
    const selectedIds = selectedRowNodes.map(function (rowNode) {
        return rowNode.id
    });
    immutableStore = immutableStore.map(function (dataItem) {
        const itemSelected = selectedIds.indexOf(dataItem.symbol) >= 0;
        if (itemSelected) {
            return {
                // symbol and price stay the same
                symbol: dataItem.symbol,
                price: dataItem.price,
                // group gets the group
                group: newGroup,
            }
        } else {
            return dataItem
        }
    })
    gridOptions.api!.setRowData(immutableStore)
}

function updatePrices() {
    const newStore: any[] = [];
    immutableStore.forEach(function (item) {
        newStore.push({
            // use same symbol as last time, this is the unique id
            symbol: item.symbol,
            // group also stays the same
            group: item.group,
            // add random price
            price: Math.floor(Math.random() * 100),
        })
    })
    immutableStore = newStore
    gridOptions.api!.setRowData(immutableStore)
}

function filter(list: any[], callback: any) {
    const filteredList: any[] = [];
    list.forEach(function (item) {
        if (callback(item)) {
            filteredList.push(item)
        }
    })
    return filteredList
}

function createItem() {
    const item = {
        group: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        symbol: createUniqueRandomSymbol(),
        price: Math.floor(Math.random() * 100),
    };
    return item
}

function onGroupingEnabled(enabled: boolean) {
    setGroupingEnabled(enabled, gridOptions.columnApi!)
}

function setGroupingEnabled(enabled: boolean, columnApi: ColumnApi) {
    if (enabled) {
        columnApi.applyColumnState({
            state: [
                { colId: 'group', rowGroup: true, hide: true },
                { colId: 'symbol', hide: true },
            ],
        })
    } else {
        columnApi.applyColumnState({
            state: [
                { colId: 'group', rowGroup: false, hide: false },
                { colId: 'symbol', hide: false },
            ],
        })
    }

    setItemVisible('groupingOn', !enabled)
    setItemVisible('groupingOff', enabled)
}

function setItemVisible(id: string, visible: boolean) {
    const element = document.querySelector('#' + id)! as any;
    element.style.display = visible ? 'inline' : 'none'
}

// creates a unique symbol, eg 'ADG' or 'ZJD'
function createUniqueRandomSymbol() {
    let symbol: any;
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let isUnique = false;
    while (!isUnique) {
        symbol = ''
        // create symbol
        for (let i = 0; i < 3; i++) {
            symbol += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        // check uniqueness
        isUnique = true
        immutableStore.forEach(function (oldItem) {
            if (oldItem.symbol === symbol) {
                isUnique = false
            }
        })
    }

    return symbol
}

function reverseItems() {
    immutableStore.reverse()
    gridOptions.api!.setRowData(immutableStore)
}

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'Symbol', field: 'symbol' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Group', field: 'group' },
    ],
    defaultColDef: {
        width: 250,
        sortable: true,
        resizable: true,
    },
    animateRows: true,
    rowSelection: 'multiple',
    autoGroupColumnDef: {
        headerName: 'Symbol',
        cellRenderer: 'agGroupCellRenderer',
        field: 'symbol',
    },
    groupDefaultExpanded: 1,
    rowData: immutableStore,
    getRowId: (params: GetRowIdParams) => {
        return params.data.symbol
    },
    onGridReady: (params) => {
        immutableStore = []
        immutableStore = getInitialData()
        params.api.setRowData(immutableStore)
        setGroupingEnabled(false, params.columnApi)
    },
}

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(eGridDiv, gridOptions)
})

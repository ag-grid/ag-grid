import { ColDef, Grid, GridOptions, GetRowIdParams, IAggFuncParams, IDoesFilterPassParams, IFilterComp, IFilterParams, IFilterType, IsGroupOpenByDefaultParams } from '@ag-grid-community/core'

import { createDataItem, getData } from './data'

let aggCallCount = 0;
let compareCallCount = 0;
let filterCallCount = 0;
function myAggFunc(params: IAggFuncParams) {
    aggCallCount++

    let total = 0;
    for (let i = 0; i < params.values.length; i++) {
        total += params.values[i]
    }
    return total
}

function myComparator(a: any, b: any) {
    compareCallCount++
    return a < b ? -1 : 1
}

function getMyFilter(): IFilterType {

    class MyFilter implements IFilterComp {
        filterParams!: IFilterParams;
        filterValue!: number | null;
        eGui: any;
        eInput: any;

        init(params: IFilterParams) {
            this.filterParams = params;
            this.filterValue = null

            this.eGui = document.createElement('div')
            this.eGui.innerHTML = '<div>Greater Than: <input type="text"/></div>'
            this.eInput = this.eGui.querySelector('input')
            this.eInput.addEventListener('input', () => {
                this.getValueFromInput()
                params.filterChangedCallback()
            })
        }

        getGui() {
            return this.eGui
        }

        getValueFromInput() {
            const value = parseInt(this.eInput.value);
            this.filterValue = isNaN(value) ? null : value
        }

        setModel(model: any) {
            this.eInput.value = model == null ? null : model.value;
            this.getValueFromInput()
        }

        getModel() {
            if (!this.isFilterActive()) {
                return null;
            }

            return { value: this.eInput.value }
        }

        isFilterActive() {
            return this.filterValue !== null
        }

        doesFilterPass(params: IDoesFilterPassParams) {
            filterCallCount++

            const { api, colDef, column, columnApi, context } = this.filterParams;
            const { node } = params;
            const value = this.filterParams.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });
            return value > (this.filterValue || 0)
        }
    }

    return MyFilter;
}


const myFilter = getMyFilter();


const columnDefs: ColDef[] = [
    { field: 'city', rowGroup: true, hide: true },
    { field: 'laptop', rowGroup: true, hide: true },
    { field: 'distro', sort: 'asc', comparator: myComparator },
    {
        field: 'value',
        enableCellChangeFlash: true,
        aggFunc: myAggFunc,
        filter: myFilter,
    },
]

function getRowId(params: GetRowIdParams) {
    return params.data.id
}

function onBtDuplicate() {
    const api = gridOptions.api!;

    // get the first child of the
    const selectedRows = api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!')
        return
    }

    const newItems: any[] = [];
    selectedRows.forEach(function (selectedRow) {
        const newItem = createDataItem(
            selectedRow.name,
            selectedRow.distro,
            selectedRow.laptop,
            selectedRow.city,
            selectedRow.value
        );
        newItems.push(newItem)
    })

    timeOperation('Duplicate', function () {
        api.applyTransaction({ add: newItems })
    })
}

function onBtUpdate() {
    const api = gridOptions.api!;

    // get the first child of the
    const selectedRows = api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!')
        return
    }

    const updatedItems: any[] = [];
    selectedRows.forEach(function (oldItem) {
        const newValue = Math.floor(Math.random() * 100) + 10;
        const newItem = createDataItem(
            oldItem.name,
            oldItem.distro,
            oldItem.laptop,
            oldItem.city,
            newValue,
            oldItem.id
        );
        updatedItems.push(newItem)
    })

    timeOperation('Update', function () {
        api.applyTransaction({ update: updatedItems })
    })
}

function onBtDelete() {
    const api = gridOptions.api!;

    // get the first child of the
    const selectedRows = api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
        console.log('No rows selected!')
        return
    }

    timeOperation('Delete', function () {
        api.applyTransaction({ remove: selectedRows })
    })
}

function onBtClearSelection() {
    gridOptions.api!.deselectAll()
}

function onBtUpdateModel() {
    const api = gridOptions.api!;

    timeOperation('Update Model', function () {
        api.refreshClientSideRowModel('filter')
    })
}

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        filter: true,
        sortable: true,
        resizable: true,
    },
    suppressModelUpdateAfterUpdateTransaction: true,
    getRowId: getRowId,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    animateRows: true,
    suppressAggAtRootLevel: true,
    suppressRowClickSelection: true,
    autoGroupColumnDef: {
        field: 'name',
        cellRendererParams: { checkbox: true },
    },
    onGridReady: (params) => {
        params.api.setFilterModel({
            value: { value: '50' },
        })

        timeOperation('Initialisation', function () {
            params.api.setRowData(getData())
        })
    },
    isGroupOpenByDefault: isGroupOpenByDefault
}

function isGroupOpenByDefault(params: IsGroupOpenByDefaultParams<IOlympicData, any>) {
    return ['Delhi', 'Seoul'].includes(params.key);
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(eGridDiv, gridOptions)
})

function timeOperation(name: string, operation: any) {
    aggCallCount = 0
    compareCallCount = 0
    filterCallCount = 0
    const start = new Date().getTime();
    operation()
    const end = new Date().getTime();
    console.log(
        name +
        ' finished in ' +
        (end - start) +
        'ms, aggCallCount = ' +
        aggCallCount +
        ', compareCallCount = ' +
        compareCallCount +
        ', filterCallCount = ' +
        filterCallCount
    )
}



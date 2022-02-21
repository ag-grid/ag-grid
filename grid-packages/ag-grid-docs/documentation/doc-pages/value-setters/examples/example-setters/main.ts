import { Grid, CellValueChangedEvent, ColDef, GridOptions, ValueGetterParams, ValueSetterParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
    {
        headerName: 'Name',
        valueGetter: function (params: ValueGetterParams) {
            return params.data.firstName + ' ' + params.data.lastName
        },
        valueSetter: function (params: ValueSetterParams) {
            var fullName = params.newValue
            var nameSplit = fullName.split(' ')
            var newFirstName = nameSplit[0]
            var newLastName = nameSplit[1]
            var data = params.data

            if (data.firstName !== newFirstName || data.lastName !== newLastName) {
                data.firstName = newFirstName
                data.lastName = newLastName
                // return true to tell grid that the value has changed, so it knows
                // to update the cell
                return true
            } else {
                // return false, the grid doesn't need to update
                return false
            }
        },
    },
    {
        headerName: 'A',
        field: 'a',
    },
    {
        headerName: 'B',
        valueGetter: function (params: ValueGetterParams) {
            return params.data.b
        },
        valueSetter: function (params: ValueSetterParams) {
            var newValInt = parseInt(params.newValue)
            var valueChanged = params.data.b !== newValInt
            if (valueChanged) {
                params.data.b = newValInt
            }
            return valueChanged
        },
    },
    {
        headerName: 'C.X',
        valueGetter: function (params: ValueGetterParams) {
            if (params.data.c) {
                return params.data.c.x
            } else {
                return undefined
            }
        },
        valueSetter: function (params: ValueSetterParams) {
            if (!params.data.c) {
                params.data.c = {}
            }
            params.data.c.x = params.newValue
            return true
        },
    },
    {
        headerName: 'C.Y',
        valueGetter: function (params: ValueGetterParams) {
            if (params.data.c) {
                return params.data.c.y
            } else {
                return undefined
            }
        },
        valueSetter: function (params: ValueSetterParams) {
            if (!params.data.c) {
                params.data.c = {}
            }
            params.data.c.y = params.newValue
            return true
        },
    },
]

const gridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        resizable: true,
        editable: true,
    },
    columnDefs: columnDefs,
    rowData: getData(),
    onCellValueChanged: onCellValueChanged,
}

function onCellValueChanged(event: CellValueChangedEvent) {
    console.log('Data after change is', event.data)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)
})

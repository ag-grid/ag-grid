import { CellValueChangedEvent, ColDef, Grid, GridOptions, ValueGetterParams, ValueSetterParams } from '@ag-grid-community/core';
import { getData } from "./data";


const columnDefs: ColDef[] = [
    {
        headerName: 'Name',
        valueGetter: (params: ValueGetterParams) => {
            return params.data.firstName + ' ' + params.data.lastName
        },
        valueSetter: (params: ValueSetterParams) => {
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
        valueGetter: (params: ValueGetterParams) => {
            return params.data.b
        },
        valueSetter: (params: ValueSetterParams) => {
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
        valueGetter: (params: ValueGetterParams) => {
            if (params.data.c) {
                return params.data.c.x
            } else {
                return undefined
            }
        },
        valueSetter: (params: ValueSetterParams) => {
            var newValInt = parseInt(params.newValue)
            if (!params.data.c) {
                params.data.c = {};
            }

            var valueChanged = params.data.c.x !== newValInt
            if (valueChanged) {
                params.data.c.x = newValInt
            }
            return valueChanged
        },
    },
    {
        headerName: 'C.Y',
        valueGetter: (params: ValueGetterParams) => {
            if (params.data.c) {
                return params.data.c.y
            } else {
                return undefined
            }
        },
        valueSetter: (params: ValueSetterParams) => {
            var newValInt = parseInt(params.newValue)
            if (!params.data.c) {
                params.data.c = {};
            }

            var valueChanged = params.data.c.y !== newValInt
            if (valueChanged) {
                params.data.c.y = newValInt
            }
            return valueChanged
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

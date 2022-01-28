import { Grid, GridOptions, ISetFilter, KeyCreatorParams, ValueFormatterParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                cellHeight: 20,
            },
        },
        { field: 'age', maxWidth: 120, filter: 'agNumberColumnFilter' },
        {
            field: 'country',
            valueFormatter: function (params: ValueFormatterParams) {
                return `${params.value.name} (${params.value.code})`
            },
            keyCreator: countryKeyCreator,
        },
        { field: 'year', maxWidth: 120 },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        filter: true,
        resizable: true,
    }
}

function countryKeyCreator(params: KeyCreatorParams) {
    return params.value.name
}

function patchData(data: any[]) {
    // hack the data, replace each country with an object of country name and code
    data.forEach(function (row) {
        const countryName = row.country
        const countryCode = countryName.substring(0, 2).toUpperCase()
        row.country = {
            name: countryName,
            code: countryCode,
        }
    })
}

function selectJohnAndKenny() {
    const instance = gridOptions.api!.getFilterInstance('athlete')!
    instance.setModel({ values: ['John Joe Nevin', 'Kenny Egan'] })
    gridOptions.api!.onFilterChanged()
}

function selectEverything() {
    const instance = gridOptions.api!.getFilterInstance('athlete')!
    instance.setModel(null)
    gridOptions.api!.onFilterChanged()
}

function selectNothing() {
    const instance = gridOptions.api!.getFilterInstance('athlete')!
    instance.setModel({ values: [] })
    gridOptions.api!.onFilterChanged()
}

function setCountriesToFranceAustralia() {
    const instance = gridOptions.api!.getFilterInstance('country') as ISetFilter;
    instance.setFilterValues(['France', 'Australia'])
    instance.applyModel()
    gridOptions.api!.onFilterChanged()
}

function setCountriesToAll() {
    const instance = gridOptions.api!.getFilterInstance('country') as ISetFilter;
    instance.resetFilterValues()
    instance.applyModel()
    gridOptions.api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            patchData(data)
            gridOptions.api!.setRowData(data)
        })
})

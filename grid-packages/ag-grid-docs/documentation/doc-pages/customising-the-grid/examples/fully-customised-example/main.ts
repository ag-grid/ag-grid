import { CellClassParams, createGrid, GridApi, GridOptions, RowClassParams, ValueFormatterParams } from '@ag-grid-community/core';
import { CountryFlagCellRenderer } from './CountryFlagCellRenderer';
import { CustomTooltip } from './CustomTooltip';

let gridApi: GridApi;

const priceCellClass = (p: CellClassParams) => {
    if (p.value < 2500000) {
        return 'very-low-cost';
    } else if (p.value < 5000000) {
        return 'low-cost';
    } else if (p.value < 7500000) {
        return 'medium-cost';
    } else if (p.value < 9000000) {
        return 'high-cost';
    } else {
        return 'very-high-cost';
    }
}

const rowClassRules = {
    'unsucessful-mission': (p: RowClassParams) => { return p.data.successful === false },
    'successful-mission': (p: RowClassParams) => { return p.data.successful === true }
}

const currencyFormatter = (params: ValueFormatterParams) => {
    return '£' + params.value.toLocaleString();
}

const dateFormatter = (params: ValueFormatterParams) => {
    return new Date(params.value).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
        { company: "RVSN USSR", country: "Kazakhstan", date: "1957-10-04", mission: "Sputnik-1", price: 9550000, successful: true },
        { company: "RVSN USSR", country: "Kazakhstan", date: "1957-11-03", mission: "Sputnik-2", price: 8990000, successful: true },
        { company: "US Navy", country: "USA", date: "1957-12-06", mission: "Vanguard TV3", price: 6860000, successful: false }
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        {
            field: "mission",
            checkboxSelection: true,
            tooltipField: 'mission'
        },
        {
            field: "country",
            cellRenderer: CountryFlagCellRenderer
        },
        {
            field: "successful",
            width: 130
        },
        {
            field: "date",
            valueFormatter: dateFormatter
        },
        {
            field: "price",
            width: 130,
            valueFormatter: currencyFormatter,
            cellClass: priceCellClass
        },
        {
            field: "company"
        }
    ],
    // Configurations applied to all columns
    defaultColDef: {
        filter: true,
        sortable: true,
        editable: true,
        resizable: true,
        tooltipComponent: CustomTooltip
    },
    // Grid Options & Callbacks
    pagination: true,
    rowSelection: 'multiple',
    rowClassRules: rowClassRules,
    tooltipShowDelay: 0,
    tooltipHideDelay: 2000,
    onCellValueChanged: (event) => {
        console.log(`New Cell Value: ${event.value}`)
    }
}
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    fetch('https://www.ag-grid.com/example-assets/space-mission-data.json')
        .then(response => response.json())
        .then((data: any) => gridApi.setRowData(data))
})
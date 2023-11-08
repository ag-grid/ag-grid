import { CellClassParams, createGrid, GridApi, GridOptions, RowClassParams, ValueFormatterParams, CellValueChangedEvent } from '@ag-grid-community/core';
import { CountryFlagCellRenderer } from './CountryFlagCellRenderer';

let gridApi: GridApi;

const cellClassRules = {
    'very-low-cost': (p: CellClassParams) => { return p.value < 2500000},
    'low-cost': (p: CellClassParams) => { return p.value > 2500000 && p.value < 5000000},
    'medium-cost': (p: CellClassParams) => { return p.value > 5000000 && p.value < 7500000},
    'high-cost': (p: CellClassParams) => { return p.value > 7500000 && p.value < 9000000},
    'very-high-cost': (p: CellClassParams) => { return p.value >= 9000000},
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
            resizable: false,
            checkboxSelection: true,
            cellClass: 'mission-cell'
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
            cellClassRules: cellClassRules,
            valueFormatter: currencyFormatter
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
        resizable: true
    },
    // Grid Options & Callbacks
    pagination: true,
    rowClass: 'row',
    rowSelection: 'multiple',
    rowClassRules: rowClassRules,
    onCellValueChanged: (event: CellValueChangedEvent) => { 
        console.log(`New Cell Value: ${event.value}`)
    }
}
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    fetch('https://downloads.jamesswinton.com/space-mission-data.json')
        .then(response => response.json())
        .then((data: any) => gridApi.setGridOption('rowData', data))
})
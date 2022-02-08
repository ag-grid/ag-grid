import { Grid, GridOptions } from "@ag-grid-community/core";

const gridOptions: GridOptions = {
    // define grid columns
    columnDefs: [
        // using default ColDef
        { field: 'athlete' },
        { field: 'sport' },

        // using number column type
        { field: 'age', type: 'numberColumn' },
        { field: 'year', type: 'numberColumn' },

        // using date and non-editable column types
        { field: 'date', type: ['dateColumn', 'nonEditableColumn'], width: 220 },
        {
            headerName: 'Medals',
            groupId: 'medalsGroup',
            children: [
                // using medal column type
                { headerName: 'Gold', field: 'gold', type: 'medalColumn' },
                { headerName: 'Silver', field: 'silver', type: 'medalColumn' },
                { headerName: 'Bronze', field: 'bronze', type: 'medalColumn' },
                { headerName: 'Total', field: 'total', type: 'medalColumn', columnGroupShow: 'closed' }
            ]
        }
    ],

    // default ColDef, gets applied to every column
    defaultColDef: {
        // set the default column width
        width: 150,
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'agTextColumnFilter',
        // enable floating filters by default
        floatingFilter: true,
        // make columns resizable
        resizable: true
    },

    // default ColGroupDef, get applied to every column group
    defaultColGroupDef: {
        marryChildren: true
    },

    // define specific column types
    columnTypes: {
        numberColumn: { width: 130, filter: 'agNumberColumnFilter' },
        medalColumn: { width: 100, columnGroupShow: 'open', filter: false },
        nonEditableColumn: { editable: false },
        dateColumn: {
            // specify we want to use the date filter
            filter: 'agDateColumnFilter',

            // add extra parameters for the date filter
            filterParams: {
                // provide comparator function
                comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
                    // In the example application, dates are stored as dd/mm/yyyy
                    // We create a Date object for comparison against the filter date
                    const dateParts = cellValue.split('/');
                    const day = Number(dateParts[0]);
                    const month = Number(dateParts[1]) - 1;
                    const year = Number(dateParts[2]);
                    const cellDate = new Date(year, month, day);

                    // Now that both parameters are Date objects, we can compare
                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    } else if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    },
    rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api!.setRowData(data));
});

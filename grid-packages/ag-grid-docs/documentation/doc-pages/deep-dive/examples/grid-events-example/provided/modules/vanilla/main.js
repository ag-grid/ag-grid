// Grid API: Access to Grid API methods
let gridApi;

// Custom Cell Renderer - Display flags in place of country values
class CountryFlagCellRenderer {
    eGui;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params) {
        this.eGui = document.createElement('img');
        this.eGui.src = `https://www.ag-grid.com/example-assets/flags/${params.value.toLowerCase()}-flag-sm.png`;
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
    refresh(params) {
        return false;
    }
}

const gridOptions = {
    // Data to be displayed
    rowData: [],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        {
            field: "mission",
            filter: true
        },
        {
            field: "country",
            cellRenderer: CountryFlagCellRenderer
        },
        { field: "successful" },
        { field: "date" },
        {
            field: "price",
            valueFormatter: (params) => { return '£' + params.value.toLocaleString(); }
        },
        { field: "company" }
    ],
    // Configurations applied to all columns
    defaultColDef: {
        editable: true,
        filter: true
    },
    // Grid Options & Callbacks
    pagination: true,
    onCellValueChanged: (event) => {
        console.log(`New Cell Value: ${event.value}`)
    }
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = agGrid.createGrid(document.querySelector('#myGrid'), gridOptions);

// Fetch Remote Data
fetch('https://downloads.jamesswinton.com/space-mission-data.json')
    .then(response => response.json())
    .then((data) => gridApi.setGridOption('rowData', data))
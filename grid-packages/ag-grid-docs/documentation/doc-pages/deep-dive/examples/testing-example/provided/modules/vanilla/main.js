// Grid API: Access to Grid API methods
let gridApi;

const dateFormatter = (params) => {
    return new Date(params.value).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

class CountryFlagCellRenderer {
    eGui;

    init(params) {
        this.eGui = document.createElement('img');
        this.eGui.src = `https://www.ag-grid.com/example-assets/flags/${params.value.toLowerCase()}-flag-sm.png`;
    }

    getGui() { 
        return this.eGui;
    }

    refresh(params) {
        return false
    }
}

const gridOptions = {
    // Data to be displayed
    rowData: [],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        {
            field: "mission",
            filter: true,
            checkboxSelection: true
        },
        {
            field: "country",
            cellRenderer: CountryFlagCellRenderer
        },
        {
            field: "successful"
        },
        {
            field: "date",
            valueFormatter: dateFormatter
        },
        {
            field: "price",
            valueFormatter: (params) => { return '£' + params.value.toLocaleString(); }
        },
        {
            field: "company"
        }
    ],
    // Configurations applied to all columns
    defaultColDef: {
        filter: true,
        editable: true
    },
    // Grid Options & Callbacks
    pagination: true,
    rowSelection: 'multiple',
    onSelectionChanged: (event) => { 
        console.log('Row Selection Event!')
    },
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
// Grid API: Access to Grid API methods
let gridApi;

const dateFormatter = (params) => {
    return new Date(params.value).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

class CompanyLogoRenderer {
    eGui;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params) {
        let companyLogo = document.createElement('img');
        companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`
        companyLogo.setAttribute('style', 'display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1)');
        
        let companyName = document.createElement('p');
        companyName.textContent = params.value;
        companyName.setAttribute('style', 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center')
        this.eGui.appendChild(companyLogo)
        this.eGui.appendChild(companyName)
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
    refresh(params) {
        return false
    }
}

class MissionResultRenderer {
    eGui;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params) {
        let icon = document.createElement('img');
        icon.src = `https://www.ag-grid.com/example-assets/icons/${params.value ? 'tick-in-circle' : 'cross-in-circle'}.png`
        icon.setAttribute('style', 'width: auto; height: auto;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; justify-content: center; height: 100%; align-items: center')
        this.eGui.appendChild(icon)
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
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
            width: 150,
            checkboxSelection: true
          },
          {
            field: "company", 
            width: 130,
            cellRenderer: CompanyLogoRenderer 
          },
          {
            field: "location",
            width: 225
          },
          {
            field: "date",
            valueFormatter: dateFormatter
          },
          {
            field: "price",
            width: 130,
            valueFormatter: (params) => { return '£' + params.value.toLocaleString(); } 
          },
          {
            field: "successful", 
            width: 120,
            cellRenderer: MissionResultRenderer 
          },
          { field: "rocket" },
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
fetch('https://www.ag-grid.com/example-assets/space-mission-data.json')
    .then(response => response.json())
    .then((data) => gridApi.setGridOption('rowData', data))
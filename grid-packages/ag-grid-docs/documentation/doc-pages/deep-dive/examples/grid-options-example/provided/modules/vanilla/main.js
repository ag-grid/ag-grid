// Grid API: Access to Grid API methods
let gridApi;

// Grid Options: Contains all of the grid configurations
const gridOptions = {
  // Row Data: The data to be displayed.
  rowData: [],
  // Column Definitions: Defines & controls grid columns.
  columnDefs: [
    { field: "mission", filter: true },
    { field: "company" },
    { field: "location" },
    { field: "date" },
    { field: "price" },
    { field: "successful" },
    { field: "rocket" }
  ],
  // Configurations applied to all columns
  defaultColDef: {
    filter: true
  },
  // Grid Options
  pagination: true
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = agGrid.createGrid(document.querySelector('#myGrid'), gridOptions);

// Fetch Remote Data
fetch('https://www.ag-grid.com/example-assets/space-mission-data.json')
  .then(response => response.json())
  .then((data) => gridApi.setGridOption('rowData', data))
import { createGrid, ColDef, GridApi, GridOptions } from '@ag-grid-community/core';

// Grid API: Access to Grid API methods
let gridApi: GridApi;

// Row Data Interface
interface IRow {
  company: string;
  country: 'USA' | 'China' | 'Kazakhstan';
  date: string;
  mission: string;
  price: number;
  successful: boolean;
}

// Grid Options: Contains all of the grid configurations
const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
      {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
      {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
      {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
    ] as IRow[],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
      { field: "mission" },
      { field: "country" },
      { field: "successful" },
      { field: "date" },
      { field: "price" },
      { field: "company" }
    ] as ColDef[],
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://downloads.jamesswinton.com/space-mission-data.json')
  .then(response => response.json())
  .then((data: any) => gridApi.setGridOption('rowData', data))
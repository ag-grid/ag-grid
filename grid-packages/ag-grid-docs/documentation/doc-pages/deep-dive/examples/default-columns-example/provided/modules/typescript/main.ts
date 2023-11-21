import { createGrid, ColDef, GridApi, GridOptions } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Row Data Interface
interface IRow {
  company: string;
  country: 'USA' | 'China' | 'Kazakhstan';
  date: string;
  mission: string;
  price: number;
  successful: boolean;
}

// Grid API: Access to Grid API methods
let gridApi: GridApi;

// Grid Options: Contains all of the grid configurations
const gridOptions: GridOptions = {
  // Data to be displayed
  rowData: [] as IRow[],
  // Columns to be displayed (Should match rowData properties)
  columnDefs: [
    { field: "mission", resizable: true },
    { field: "country" },
    { field: "successful" },
    { field: "date" },
    { field: "price" },
    { field: "company" }
  ] as ColDef[],
  // Configurations applied to all columns
  defaultColDef: {
    filter: true,
    sortable: true,
    editable: true,
    resizable: true
  } as ColDef,
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://downloads.jamesswinton.com/space-mission-data.json')
  .then(response => response.json())
  .then((data: any) => gridApi.setGridOption('rowData', data))
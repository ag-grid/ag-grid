import {
  ColDef,
  createGrid,
  GridApi,
  GridOptions,
} from "@ag-grid-community/core"
import { CompanyLogoRenderer } from './companyLogoRenderer_typescript'
import { MissionResultRenderer } from './missionResultRenderer_typescript'
import { CustomButtonComponent } from './customButtonComponent_typescript'
import { PriceRenderer } from './priceRenderer_typescript'
import { CompanyRenderer } from './companyRenderer_typescript'

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Grid API: Access to Grid API methods
let gridApi: GridApi

// Row Data Interface
interface IRow {
  company: string
  location: string
  price: number
  successful: boolean
}

const gridOptions: GridOptions = {
  // Data to be displayed
  rowData: [] as IRow[],
  // Columns to be displayed (Should match rowData properties)
  columnDefs: [
    {
      field: "company",
      cellRenderer: CompanyRenderer,
    },
    {
      headerName: "Logo",
      field: "company",
      cellRenderer: CompanyLogoRenderer,
    },
    {
      headerName: "Mission Cost",
      field: "price",
      cellRenderer: PriceRenderer,
    },
    {
      field: "successful",
      headerName: "Success",
      cellRenderer: MissionResultRenderer,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: CustomButtonComponent,
    },
  ] as ColDef[],
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/small-space-mission-data.json')
    .then(response => response.json())
    .then(data => {
      gridApi!.setGridOption('rowData', data)
    })
})

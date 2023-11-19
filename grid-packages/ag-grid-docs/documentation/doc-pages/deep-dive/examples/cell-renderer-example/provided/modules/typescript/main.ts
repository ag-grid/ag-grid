import { createGrid, ColDef, GridApi, GridOptions, CellValueChangedEvent, SelectionChangedEvent, ValueFormatterParams, ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";

// Grid API: Access to Grid API methods
let gridApi: GridApi;

// Custom Cell Renderer - Display flags in place of country values
class CountryFlagCellRenderer implements ICellRendererComp {
    eGui!: HTMLImageElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        this.eGui = document.createElement('img');
        this.eGui.src = `https://www.ag-grid.com/example-assets/flags/${params.value.toLowerCase()}-flag-sm.png`;
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
    refresh(params: ICellRendererParams): boolean {
        return false
    }
}

// Row Data Interface
interface IRow {
  company: string;
  country: 'USA' | 'China' | 'Kazakhstan';
  date: string;
  mission: string;
  price: number;
  successful: boolean;
}

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [
        {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
        {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
        {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
    ] as IRow[],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        {
            field: "mission", resizable: false },
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
    ] as ColDef[],
    // Configurations applied to all columns
    defaultColDef: {
        resizable: true
    } as ColDef,
    // Grid Options & Callbacks
    pagination: true
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://downloads.jamesswinton.com/space-mission-data.json')
    .then(response => response.json())
    .then((data: any) => gridApi.setGridOption('rowData', data))
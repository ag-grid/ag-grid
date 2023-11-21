import { createGrid, ColDef, GridApi, GridOptions, CellValueChangedEvent, SelectionChangedEvent, ValueFormatterParams, ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

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
    rowData: [] as IRow[],
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
        editable: true,
        resizable: true
    } as ColDef,
    // Grid Options & Callbacks
    pagination: true,
    onCellValueChanged: (event: CellValueChangedEvent) => {
        console.log(`New Cell Value: ${event.value}`)
    }
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://downloads.jamesswinton.com/space-mission-data.json')
    .then(response => response.json())
    .then((data: any) => gridApi.setGridOption('rowData', data))
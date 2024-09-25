import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, ModuleRegistry, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Row Data Interface
interface IRow {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

// Grid API: Access to Grid API methods
let gridApi: GridApi;

// Grid Options: Contains all of the grid configurations
const gridOptions: GridOptions<IRow> = {
    // Data to be displayed
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }],
};
// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

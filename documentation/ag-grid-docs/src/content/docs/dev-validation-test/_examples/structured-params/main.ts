import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// Register the dev-only ValidationModule (configured to show the overlay) alongside RowGroupingModule,
// which brings aggregation. Registering ValidationModule in the modules array (rather than via the
// enableDevValidations helper) is what lets the framework example generators carry it into the modules prop.
ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, ValidationModule.with({ overlay: 'all' })]);

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'make', rowGroup: true },
        // An unregistered cellRenderer. Resolving the component fails and emits error #101, whose
        // `agGridDefaults`/`jsComps` params are objects — the object-valued counterpart to #109.
        { field: 'model', cellRenderer: 'notARealCellRenderer' },
        // An aggFunc that isn't registered. When the grouped rows aggregate, the grid can't resolve it
        // and emits error #109, whose `allSuggestions` array lists the valid aggregation names.
        { field: 'price', aggFunc: 'notARealAggFunc' },
    ],
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950 },
        { make: 'Ford', model: 'F-Series', price: 33850 },
        { make: 'Toyota', model: 'Corolla', price: 29600 },
    ],
    // Expand groups so the leaf cells render on load and the invalid cellRenderer surfaces #101.
    groupDefaultExpanded: -1,
};

let api: GridApi;

api = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

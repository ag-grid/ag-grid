import type { ColDef, GridApi, GridOptions, MenuItemDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    // ColumnMenuModule provides the stock menu items (e.g. pinning) used in the tool panel menu below
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200, enableRowGroup: true },
    { field: 'age', enableValue: true },
    { field: 'country', minWidth: 200, enableRowGroup: true },
    { field: 'year', enableRowGroup: true },
    { field: 'sport', minWidth: 200, enableRowGroup: true },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    sideBar: 'columns',
    getColumnMenuItems: (params) => {
        // Only customise the Columns Tool Panel menu; other menus keep their default items.
        if (params.source === 'columnsToolPanel') {
            const highlightColumn: MenuItemDef = {
                name: 'Highlight Column',
                action: () => {
                    const colId = params.column?.getColId();
                    console.log(`Highlight column: ${colId}`);
                },
            };

            // Append an optional pinning sub-menu and a custom item to the built-in tool panel items.
            return [...params.defaultItems, 'separator', 'pinSubMenu', highlightColumn];
        }

        return params.defaultItems;
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

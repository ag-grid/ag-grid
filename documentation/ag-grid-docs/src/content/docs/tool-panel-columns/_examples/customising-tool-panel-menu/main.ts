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

const highlightedColumns = new Set<string>();

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        cellClassRules: {
            'highlight-column': (params) => highlightedColumns.has(params.column.getColId()),
        },
    },
    sideBar: 'columns',
    getColumnMenuItems: (params) => {
        // Leave the column header menu with its default items; only customise the Columns Tool Panel menu.
        if (params.source !== 'columnsToolPanel') {
            return params.defaultItems;
        }

        const colId = params.column?.getColId();
        const highlightColumn: MenuItemDef = {
            name: 'Highlight Column',
            checked: colId ? highlightedColumns.has(colId) : false,
            action: () => {
                if (!colId) {
                    return;
                }
                if (highlightedColumns.has(colId)) {
                    highlightedColumns.delete(colId);
                } else {
                    highlightedColumns.add(colId);
                }
                gridApi.refreshCells({ force: true });
            },
        };

        // Append an optional pinning sub-menu and a custom item to the built-in tool panel items.
        return [...params.defaultItems, 'separator', 'pinSubMenu', highlightColumn];
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

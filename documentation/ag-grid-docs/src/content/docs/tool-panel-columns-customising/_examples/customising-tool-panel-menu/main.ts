import type { ColDef, GridApi, GridOptions, MenuItemDef } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    CellStyleModule,
    RowApiModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200, enableRowGroup: true },
    { field: 'age', enableValue: true },
    { field: 'country', minWidth: 200, enableRowGroup: true },
    { field: 'year', enableRowGroup: true },
    { field: 'sport', minWidth: 200, enableRowGroup: true },
    { field: 'gold', enableValue: true },
    {
        field: 'silver',
        enableValue: true,
        // column-level override: hide the "Scroll into View" item for this column only.
        // colDef.columnMenuItems takes priority over getColumnMenuItems, so silver and
        // bronze don't get the Highlight Column item added below.
        columnMenuItems: (params) => params.defaultItems.filter((item) => item !== 'scrollIntoView'),
    },
    // column-level override: only ever show the "Add to values" item
    { field: 'bronze', enableValue: true, columnMenuItems: ['value'] },
];

const highlightedColumns = new Set<string>();

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        cellStyle: (params) =>
            highlightedColumns.has(params.column.getColId()) ? { backgroundColor: 'rgba(255, 193, 7, 0.25)' } : null,
    },
    sideBar: 'columns',
    getColumnMenuItems: (params) => {
        // Customise the Columns Tool Panel menu
        if (params.source === 'columnsToolPanel') {
            const colId = params.column?.getColId();
            const highlightColumn: MenuItemDef = {
                name: 'Highlight Column',
                checked: colId ? highlightedColumns.has(colId) : false,
                action: () => {
                    if (!colId) return;

                    if (highlightedColumns.has(colId)) {
                        highlightedColumns.delete(colId);
                    } else {
                        highlightedColumns.add(colId);
                    }

                    // Redraw rows so cellStyle re-evaluates on fresh cells
                    params.api.redrawRows();
                },
            };

            // Append an optional pinning sub-menu and a custom item to the built-in tool panel items
            return [...params.defaultItems, 'separator', 'pinSubMenu', highlightColumn];
        }

        // Return default for column header menu and column picker
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

import type {
    ColDef,
    DefaultColumnMenuItem,
    GetColumnMenuItemsParams,
    GridApi,
    GridOptions,
    MenuItemDef,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
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
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200 },
    {
        field: 'age',
        enableValue: true,
        minWidth: 150,
        columnMenuItems: (params: GetColumnMenuItemsParams) => {
            // 'value' is a Columns Tool Panel token; it resolves on the column menu too.
            const menuItems: (DefaultColumnMenuItem | MenuItemDef)[] = [
                'value',
                'separator',
                ...params.defaultItems,
                {
                    name: 'A Custom Item',
                    action: () => {
                        console.log('A Custom Item selected');
                    },
                },
                {
                    name: 'Custom Sub Menu',
                    subMenu: [
                        {
                            name: 'Black',
                            action: () => {
                                console.log('Black was pressed');
                            },
                        },
                        {
                            name: 'White',
                            action: () => {
                                console.log('White was pressed');
                            },
                        },
                        {
                            name: 'Grey',
                            action: () => {
                                console.log('Grey was pressed');
                            },
                        },
                    ],
                },
            ];
            return menuItems;
        },
    },
    {
        field: 'country',
        minWidth: 200,
        columnMenuItems: [
            {
                // our own item with an icon
                name: 'A Custom Item',
                action: () => {
                    console.log('A Custom Item selected');
                },
                icon: '<img src="https://www.ag-grid.com/example-assets/lab.png" style="width: 14px;" />',
            },
            {
                // our own icon with a check box
                name: 'Another Custom Item',
                action: () => {
                    console.log('Another Custom Item selected');
                },
                checked: true,
            },
            'resetColumns', // a built in item
        ],
    },
    {
        field: 'year',
        columnMenuItems: (params: GetColumnMenuItemsParams) => {
            const menuItems: (DefaultColumnMenuItem | MenuItemDef)[] = [];
            const itemsToExclude = ['separator', 'pinSubMenu', 'valueAggSubMenu'];
            params.defaultItems.forEach((item) => {
                if (itemsToExclude.indexOf(item) < 0) {
                    menuItems.push(item);
                }
            });
            return menuItems;
        },
    },
    { field: 'sport', minWidth: 200, rowGroup: true, enableRowGroup: true },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    autoGroupColumnDef: {
        minWidth: 330,
    },
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

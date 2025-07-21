import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    NumberFilterModule,
    RowSelectionModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    PaginationModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
    StatusBarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ColumnsToolPanelModule,
    ColumnAutoSizeModule,
    TextFilterModule,
    RowSelectionModule,
    ClientSideRowModelModule,
    CellSelectionModule,
    StatusBarModule,
    NumberFilterModule,
    ColumnMenuModule,
    PaginationModule,
    SideBarModule,
    RowGroupingModule,
    PivotModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', enableRowGroup: true, enablePivot: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: { filter: true, minWidth: 100 },
    autoSizeStrategy: {
        type: 'fitCellContents',
    },
    getRowId: (params) => `${kebabCase(params.data?.athlete)}-${params.data?.year}`,
    rowSelection: {
        mode: 'multiRow',
    },
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' },
        ],
    },
    cellSelection: true,
    pagination: true,
    sideBar: 'columns',
};

document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridApi = createGrid(eGridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

function kebabCase(s: string): string {
    return s.toLowerCase().replaceAll(' ', '-');
}

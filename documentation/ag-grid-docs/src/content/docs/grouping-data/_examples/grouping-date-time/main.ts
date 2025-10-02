import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    SideBarModule,
    ColumnsToolPanelModule,
    RowGroupingPanelModule,
    PivotModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const COL_DEFS: ColDef<IOlympicData>[] = [
    {
        field: 'date',
        rowGroup: true,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupingHierarchy: ['year', 'month'],
    },
    { field: 'country' },
    { field: 'sport' },
    { field: 'total', aggFunc: 'sum' },
];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: COL_DEFS,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((d) => ({
                    ...d,
                    date: d.date?.split('/').reverse().join('-'),
                }))
            )
        );
});

function onChangeFormattedMonth(event: any) {
    const month = event.target.checked ? 'formattedMonth' : 'month';
    COL_DEFS[0].rowGroupingHierarchy![1] = month;
    gridApi.setGridOption('columnDefs', COL_DEFS);
}

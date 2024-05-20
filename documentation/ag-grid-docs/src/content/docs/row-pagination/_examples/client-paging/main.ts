import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    CheckboxSelectionCallbackParams,
    ColDef,
    GridApi,
    GridOptions,
    HeaderCheckboxSelectionCallbackParams,
    IGroupCellRendererParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

var checkboxSelection = function (params: CheckboxSelectionCallbackParams) {
    // we put checkbox on the name if we are not doing grouping
    return params.api.getRowGroupColumns().length === 0;
};
var headerCheckboxSelection = function (params: HeaderCheckboxSelectionCallbackParams) {
    // we put checkbox on the name if we are not doing grouping
    return params.api.getRowGroupColumns().length === 0;
};
const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 170,
        checkboxSelection: checkboxSelection,
        headerCheckboxSelection: headerCheckboxSelection,
    },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

var autoGroupColumnDef: ColDef = {
    headerName: 'Group',
    minWidth: 170,
    field: 'athlete',
    valueGetter: (params) => {
        if (params.node!.group) {
            return params.node!.key;
        } else {
            return params.data[params.colDef.field!];
        }
    },
    headerCheckboxSelection: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true,
    } as IGroupCellRendererParams,
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        editable: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filter: true,
        flex: 1,
        minWidth: 100,
    },
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    // debug: true,
    rowSelection: 'multiple',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    columnDefs: columnDefs,
    pagination: true,
    autoGroupColumnDef: autoGroupColumnDef,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

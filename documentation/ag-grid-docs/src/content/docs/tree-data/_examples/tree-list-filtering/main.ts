import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GetRowIdParams,
    GridApi,
    GridOptions,
    ISetFilterParams,
    KeyCreatorParams,
    ValueFormatterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'employmentType' },
        {
            field: 'startDate',
            valueFormatter: (params: ValueFormatterParams) =>
                params.value ? params.value.toLocaleDateString() : params.value,
            filterParams: {
                treeList: true,
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value ? params.value.toLocaleDateString() : '(Blanks)',
            } as ISetFilterParams<any, Date>,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        filter: true,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        headerName: 'Employee',
        field: 'employeeName',
        cellRendererParams: {
            suppressCount: true,
        },
        filter: 'agSetColumnFilter',
        filterParams: {
            treeList: true,
            keyCreator: (params: KeyCreatorParams) => (params.value ? params.value.join('#') : null),
        } as ISetFilterParams<any, string[]>,
        minWidth: 280,
    },
    treeData: true,
    groupDefaultExpanded: -1,
    getDataPath: (data: any) => data.dataPath,
    getRowId: (params: GetRowIdParams<any>) => String(params.data.employeeId),
};

function processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
        const dateParts = row.startDate.split('/');
        const startDate = new Date(parseInt(dateParts[2]), dateParts[1] - 1, dateParts[0]);
        const dataPath = [...parentPath, row.employeeName];
        flattenedData.push({ ...row, dataPath, startDate });
        if (row.underlings) {
            row.underlings.forEach((underling: any) => flattenRowRecursive(underling, dataPath));
        }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/tree-data.json')
        .then((response) => response.json())
        .then((data) => gridApi!.setGridOption('rowData', processData(data)));
});

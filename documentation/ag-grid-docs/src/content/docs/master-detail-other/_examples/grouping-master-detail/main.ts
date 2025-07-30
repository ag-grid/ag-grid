import type {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    IDetailCellRendererParams,
    IRowNode,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    MasterDetailModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import type { IAccount, ICallRecord } from './data';
import { accountsData } from './data';

ModuleRegistry.registerModules([
    RowApiModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MasterDetailModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IAccount>;

const gridOptions: GridOptions<IAccount> = {
    columnDefs: [{ field: 'region', rowGroup: true, hide: true }, { field: 'name' }, { field: 'account' }],
    rowData: accountsData,
    defaultColDef: {
        flex: 1,
        filter: true,
    },
    autoGroupColumnDef: {
        field: 'region',
        headerName: 'Region',
    },
    masterDetail: true,
    getRowId: (params) => params.data.id,
    isRowMaster: (dataItem: IAccount) => dataItem.callRecords.length > 0,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
            ],
            defaultColDef: {
                flex: 1,
                filter: true,
            },
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.callRecords);
        },
    } as IDetailCellRendererParams<IAccount, ICallRecord>,
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(() => {
        expandAllParents(params.api.getRowNode('1'));
    }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

function expandAllParents(row: IRowNode | null | undefined) {
    let current = row;
    while (current && current.level >= 0) {
        current.setExpanded(true);
        current = current.parent;
    }
}

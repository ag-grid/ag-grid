import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, IDetailCellRendererParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MasterDetailModule, MenuModule]);

let gridApi: GridApi<IAccount>;

const gridOptions: GridOptions<IAccount> = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    ],
    defaultColDef: {
        flex: 1,
    },
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction', minWidth: 150 },
                { field: 'number' },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
            ],
            defaultColDef: {
                flex: 1,
            },
        },
        getDetailRowData: (params) => {
            // simulate delayed supply of data to the detail pane
            setTimeout(() => {
                params.successCallback(params.data.callRecords);
            }, 1000);
        },
    } as IDetailCellRendererParams<IAccount, ICallRecord>,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => {
            gridApi!.setGridOption('rowData', data);
        });
});

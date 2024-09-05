import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    FirstDataRenderedEvent,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IDetailCellRendererParams,
    createGrid,
} from '@ag-grid-community/core';
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
        enableCellChangeFlash: true,
    },
    getRowId: (params: GetRowIdParams) => {
        return String(params.data.account);
    },
    masterDetail: true,
    detailCellRendererParams: {
        refreshStrategy: 'rows',
        template: (params) => {
            return `<div class="ag-details-row ag-details-row-fixed-height">
            <div style="padding: 4px; font-weight: bold;">${params.data ? params.data.name : ''} ${params.data ? params.data.calls : ''} calls</div>
            <div data-ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height"/>
         </div>`;
        },

        detailGridOptions: {
            selection: { mode: 'multiRow', headerCheckbox: false, checkboxes: false },
            getRowId: (params: GetRowIdParams) => {
                return String(params.data.callId);
            },
            columnDefs: [
                { field: 'callId', checkboxSelection: true },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
            ],
            defaultColDef: {
                flex: 1,
                enableCellChangeFlash: true,
            },
        },
        getDetailRowData: (params) => {
            // params.successCallback([]);
            params.successCallback(params.data.callRecords);
        },
    } as IDetailCellRendererParams<IAccount, ICallRecord>,
    onFirstDataRendered: onFirstDataRendered,
};

let allRowData: any[];

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(() => {
        params.api.getDisplayedRowAtIndex(0)!.setExpanded(true);
    }, 0);

    setInterval(() => {
        if (!allRowData) {
            return;
        }

        const data = allRowData[0];

        const newCallRecords: any[] = [];
        data.callRecords.forEach(function (record: any, index: number) {
            newCallRecords.push({
                name: record.name,
                callId: record.callId,
                duration: record.duration + (index % 2),
                switchCode: record.switchCode,
                direction: record.direction,
                number: record.number,
            });
        });

        data.callRecords = newCallRecords;
        data.calls++;

        const tran = {
            update: [data],
        };

        params.api.applyTransaction(tran);
    }, 2000);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => {
            allRowData = data;
            gridApi!.setGridOption('rowData', data);
        });
});

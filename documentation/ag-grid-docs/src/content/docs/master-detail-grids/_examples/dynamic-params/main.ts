import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    ICellRendererParams,
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
    },
    masterDetail: true,
    detailRowHeight: 195,
    detailCellRendererParams: (params: ICellRendererParams) => {
        var res = {} as IDetailCellRendererParams;

        // we use the same getDetailRowData for both options
        res.getDetailRowData = function (params) {
            params.successCallback(params.data.callRecords);
        };

        var nameMatch = params.data.name === 'Mila Smith' || params.data.name === 'Harper Johnson';

        if (nameMatch) {
            // grid options for columns {callId, number}
            res.detailGridOptions = {
                columnDefs: [{ field: 'callId' }, { field: 'number' }],
                defaultColDef: {
                    flex: 1,
                },
            };
        } else {
            // grid options for columns {callId, direction, duration, switchCode}
            res.detailGridOptions = {
                columnDefs: [
                    { field: 'callId' },
                    { field: 'direction' },
                    { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                    { field: 'switchCode' },
                ],
                defaultColDef: {
                    flex: 1,
                },
            };
        }

        return res;
    },
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(() => {
        var node1 = params.api.getDisplayedRowAtIndex(1)!;
        var node2 = params.api.getDisplayedRowAtIndex(2)!;
        node1.setExpanded(true);
        node2.setExpanded(true);
    }, 0);
}

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

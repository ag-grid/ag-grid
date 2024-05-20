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
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    MasterDetailModule,
    MenuModule,
]);

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
    getRowId: (params: GetRowIdParams) => {
        return params.data.name;
    },
    groupDefaultExpanded: 1,
    rowBuffer: 100,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
            ],
            defaultColDef: {
                flex: 1,
            },
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.callRecords);
        },
    } as IDetailCellRendererParams<IAccount, ICallRecord>,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.forEachNode(function (node) {
        node.setExpanded(true);
    });
}

function onBtExport() {
    var spreadsheets = [];

    const mainSheet = gridApi!.getSheetDataForExcel();
    if (mainSheet) {
        spreadsheets.push(mainSheet);
    }

    gridApi!.forEachDetailGridInfo(function (node) {
        const sheet = node.api!.getSheetDataForExcel({
            sheetName: node.id.replace('detail_', ''),
        });
        if (sheet) {
            spreadsheets.push(sheet);
        }
    });

    gridApi!.exportMultipleSheetsAsExcel({
        data: spreadsheets,
        fileName: 'ag-grid.xlsx',
    });
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

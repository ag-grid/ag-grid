import type {
    GridApi,
    GridOptions,
    IDetailCellRendererParams,
    PdfCell,
    PdfCellStyle,
    ProcessRowGroupForExportParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, MasterDetailModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    MasterDetailModule,
    PdfExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

const detailHeadingStyle: PdfCellStyle = {
    backgroundColor: '#d9eaf7',
    color: '#19486a',
    fontWeight: 'bold',
    padding: 6,
};

const detailHeaderStyle: PdfCellStyle = {
    backgroundColor: '#eef4f8',
    color: '#243746',
    fontWeight: 'bold',
    padding: 5,
};

function getDetailRows(params: ProcessRowGroupForExportParams<IAccount>): PdfCell[][] {
    const account = params.node.data;
    if (!account) {
        return [];
    }

    const rows: PdfCell[][] = [
        [
            {
                data: { value: `Calls for ${account.name}` },
                mergeAcross: 3,
                style: detailHeadingStyle,
            },
        ],
        [
            { data: { value: 'Call ID' }, style: detailHeaderStyle },
            { data: { value: 'Direction' }, style: detailHeaderStyle },
            { data: { value: 'Number' }, style: detailHeaderStyle },
            { data: { value: 'Duration / Switch Code' }, style: detailHeaderStyle },
        ],
    ];

    for (const record of account.callRecords) {
        rows.push([
            { data: { value: String(record.callId) } },
            { data: { value: record.direction } },
            { data: { value: record.number } },
            { data: { value: `${record.duration}s / ${record.switchCode}` } },
        ]);
    }

    return rows;
}

let gridApi: GridApi<IAccount>;

const gridOptions: GridOptions<IAccount> = {
    columnDefs: [
        { field: 'name', cellRenderer: 'agGroupCellRenderer', minWidth: 180 },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: (params) => `${params.value}m` },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
    },
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: (params) => `${params.value}s` },
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
    defaultPdfExportParams: {
        columnWidth: 'auto',
        getCustomContentBelowRow: getDetailRows,
    },
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => {
            gridApi.setGridOption('rowData', data.slice(0, 3));
        });
});

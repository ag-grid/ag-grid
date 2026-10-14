import type {
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import {
    CellStyleModule,
    CheckboxEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    DateEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RichSelectModule, TransposeModule } from 'ag-grid-enterprise';

import type { CompanyRecord } from './data';
import { createRecord, getData } from './data';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnApiModule,
    TransposeModule,
    CellStyleModule,
    CheckboxEditorModule,
    TextEditorModule,
    NumberEditorModule,
    DateEditorModule,
    RichSelectModule,
    NumberFilterModule,
    ValidationModule,
]);

const currency = (params: ValueFormatterParams) =>
    params.value == null ? '' : `£${Number(params.value).toLocaleString('en-GB')}m`;

const grossProfit = (params: ValueGetterParams<CompanyRecord>) =>
    params.data ? params.data.revenue - params.data.costOfSales : null;

const columnDefs: (ColDef<CompanyRecord> | ColGroupDef<CompanyRecord>)[] = [
    { field: 'name', headerName: 'Company', pinned: 'left' },
    {
        headerName: 'Details',
        children: [
            {
                field: 'region',
                cellEditor: 'agRichSelectCellEditor',
                cellEditorParams: { values: ['EMEA', 'Americas', 'APAC'] },
            },
            { field: 'sector' },
            { field: 'listed', cellDataType: 'date' },
            { field: 'active', cellDataType: 'boolean' },
            { field: 'rating', cellClass: 'rating-cell' },
        ],
    },
    {
        headerName: 'Income Statement',
        children: [
            { field: 'revenue', valueFormatter: currency, cellEditorParams: { min: 0, max: 5000 } },
            { field: 'costOfSales', headerName: 'Cost of Sales', valueFormatter: currency },
            {
                colId: 'grossProfit',
                headerName: 'Gross Profit',
                valueGetter: grossProfit,
                valueFormatter: currency,
                editable: false,
                cellClassRules: { 'negative-value': (params) => params.value < 0 },
            },
            { field: 'operatingCosts', headerName: 'Operating Costs', valueFormatter: currency },
        ],
    },
    {
        headerName: 'Balance Sheet',
        children: [
            { field: 'assets', valueFormatter: currency },
            { field: 'liabilities', valueFormatter: currency },
            {
                colId: 'equity',
                headerName: 'Equity',
                valueGetter: (params: ValueGetterParams<CompanyRecord>) =>
                    params.data ? params.data.assets - params.data.liabilities : null,
                valueFormatter: currency,
                editable: false,
                cellStyle: (params) => (params.value < 0 ? { color: 'var(--negative-colour)' } : null),
            },
            { field: 'headcount', cellEditorParams: { min: 1 } },
        ],
    },
];

let gridApi: GridApi<CompanyRecord>;
let nextRecord = 6;

const gridOptions: GridOptions<CompanyRecord> = {
    columnDefs,
    defaultColDef: {
        width: 150,
        editable: true,
        filter: true,
    },
    getRowId: (params) => params.data.id,
    rowData: getData(),
    transpose: true,
    transposeHeaderColId: 'name',
    onCellValueChanged: (event) => {
        log(
            `cellValueChanged: ${event.data.name} / ${event.colDef.field ?? event.column.getColId()} → ${event.newValue}`
        );
    },
};

function log(message: string) {
    const eLog = document.querySelector<HTMLElement>('#eventLog')!;
    eLog.textContent = message + '\n' + eLog.textContent;
}

function toggleTranspose() {
    const transpose = !gridApi.getGridOption('transpose');
    gridApi.setGridOption('transpose', transpose);
    document.querySelector<HTMLElement>('#transposeButton')!.textContent = transpose
        ? 'Disable transpose'
        : 'Enable transpose';
}

function sortByRevenue() {
    const current = gridApi.getColumnState().find((state) => state.colId === 'revenue')?.sort;
    gridApi.applyColumnState({
        state: [{ colId: 'revenue', sort: current === 'desc' ? 'asc' : 'desc' }],
        defaultState: { sort: null },
    });
}

function filterLargeRevenue() {
    const hasFilter = gridApi.getColumnFilterModel('revenue') != null;
    gridApi.setColumnFilterModel('revenue', hasFilter ? null : { type: 'greaterThan', filter: 800 }).then(() => {
        gridApi.onFilterChanged();
    });
}

function addRecord() {
    gridApi.applyTransaction({ add: [createRecord(nextRecord++)] });
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

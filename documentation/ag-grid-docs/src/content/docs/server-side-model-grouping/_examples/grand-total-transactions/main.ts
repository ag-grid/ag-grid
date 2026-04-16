import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface RowData {
    id: string;
    country: string;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
}

const countries = ['Ireland', 'Spain', 'UK', 'France', 'Germany', 'Italy', 'Portugal', 'Sweden', 'Norway', 'Denmark'];
const sports = ['Swimming', 'Running', 'Cycling', 'Gymnastics', 'Rowing', 'Boxing'];

const rowData: RowData[] = [];
let nextId = 1;
for (const country of countries) {
    for (const sport of sports) {
        rowData.push({
            id: String(nextId++),
            country,
            sport,
            gold: Math.floor(Math.random() * 5),
            silver: Math.floor(Math.random() * 5),
            bronze: Math.floor(Math.random() * 5),
        });
    }
}

function computeGrandTotal(data: RowData[]): RowData {
    const totals = data.reduce(
        (acc, row) => ({
            gold: acc.gold + row.gold,
            silver: acc.silver + row.silver,
            bronze: acc.bronze + row.bronze,
        }),
        { gold: 0, silver: 0, bronze: 0 }
    );
    return { id: GRAND_TOTAL_ROW_ID, country: '', sport: '', ...totals };
}

function getServerSideDatasource(): IServerSideDatasource {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // Provide the grand total via the grandTotalData field
            const grandTotalData = params.needsGrandTotal ? computeGrandTotal(rowData) : undefined;

            setTimeout(() => {
                params.success({ rowData: [...rowData], rowCount: rowData.length, grandTotalData });
            }, 200);
        },
    };
}

let gridApi: GridApi<RowData>;

const gridOptions: GridOptions<RowData> = {
    columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowModelType: 'serverSide',
    grandTotalRow: 'bottom',
    getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
    serverSideDatasource: getServerSideDatasource(),
};

function updateGrandTotal() {
    // Recompute grand total and update via transaction
    const total = computeGrandTotal(rowData);
    total.gold += 10; // Simulate updated values
    gridApi.applyServerSideTransaction({ update: [total] });
}

function removeGrandTotal() {
    gridApi.applyServerSideTransaction({
        remove: [{ id: GRAND_TOTAL_ROW_ID } as RowData],
    });
}

function addGrandTotal() {
    gridApi.applyServerSideTransaction({
        add: [computeGrandTotal(rowData)],
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

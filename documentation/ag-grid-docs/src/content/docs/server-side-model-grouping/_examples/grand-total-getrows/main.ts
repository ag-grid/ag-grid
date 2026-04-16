import type { GetRowIdParams, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ServerSideRowModelModule,
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

function getServerSideDatasource(): IServerSideDatasource {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // Compute grand total from all rows

            const initial: Partial<RowData> = {
                id: GRAND_TOTAL_ROW_ID,
                gold: 0,
                silver: 0,
                bronze: 0,
            };

            const grandTotalData: Partial<RowData> = rowData.reduce(
                (acc, row) => ({
                    ...acc,
                    gold: acc.gold! + row.gold,
                    silver: acc.silver! + row.silver,
                    bronze: acc.bronze! + row.bronze,
                }),
                initial
            );

            setTimeout(() => {
                params.success({
                    rowData: [...rowData],
                    rowCount: rowData.length,
                    grandTotalData,
                });
            }, 200);
        },
    };
}

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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});

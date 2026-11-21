import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { AutoGenerateColumnsModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ServerSideRowModelModule, AutoGenerateColumnsModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowModelType: 'serverSide',
    // columns are generated from the rows of the first response
    autoGenerateColumnDefs: true,
    defaultColDef: {
        flex: 1,
    },
};

// missing values sort last
function compareValues(a: string | number | null, b: string | number | null): number {
    if (a == null || b == null) {
        return a == null ? (b == null ? 0 : 1) : -1;
    }
    return a > b ? 1 : a < b ? -1 : 0;
}

function createDatasource(allRows: IOlympicData[]): IServerSideDatasource<IOlympicData> {
    return {
        getRows: (params) => {
            const { startRow = 0, endRow = allRows.length, sortModel } = params.request;
            const rows = [...allRows];
            for (const { colId, sort } of [...sortModel].reverse()) {
                const direction = sort === 'asc' ? 1 : -1;
                const field = colId as keyof IOlympicData;
                rows.sort((a, b) => compareValues(a[field], b[field]) * direction);
            }

            // simulating a real server call with a 500ms delay
            setTimeout(() => {
                params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
            }, 500);
        },
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('serverSideDatasource', createDatasource(data)));
});

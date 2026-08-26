import type { GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations, themeQuartz } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ServerSideRowModelModule]);

const TOTAL_ROWS = 500;
const BLOCK_SIZE = 100;

const allData = Array.from({ length: TOTAL_ROWS }, (_, i) => ({
    id: 'D' + (1000 + i),
}));

const gridOptions: GridOptions = {
    theme: themeQuartz.withParams({
        autoHeightMaxBodyHeight: 250,
    }),
    domLayout: 'autoHeight',
    columnDefs: [{ field: 'id' }],
    defaultColDef: {
        flex: 1,
    },
    rowModelType: 'serverSide',
    cacheBlockSize: BLOCK_SIZE,
    serverSideDatasource: createServerSideDatasource(),
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

function createServerSideDatasource(): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            const response = getData(params.request);

            // simulating a real server call with a short delay
            setTimeout(() => {
                params.success(response);
            }, 200);
        },
    };
}

function getData(request: IServerSideGetRowsRequest) {
    return {
        rowData: allData.slice(request.startRow, request.endRow),
        rowCount: TOTAL_ROWS,
    };
}

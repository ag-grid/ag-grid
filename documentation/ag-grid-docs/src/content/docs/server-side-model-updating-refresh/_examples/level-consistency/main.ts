import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    ServerSideLevelInconsistentEvent,
} from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ServerSideRowModelModule, ServerSideRowModelApiModule]);

interface Item {
    id: string;
    name: string;
}

let nextId = 0;
const createItem = (): Item => {
    const id = nextId++;
    return { id: String(id), name: `Item ${id}` };
};

let serverRows: Item[] = Array.from({ length: 200 }, createItem);
let changeCount = 0;
const requestedBlocks = new Set<number>();
let inconsistencyCount = 0;

const changeServerData = () => {
    if (changeCount++ % 2 === 0) {
        serverRows = serverRows.slice(1);
    } else {
        serverRows = [createItem(), ...serverRows];
    }
};

const levelDatasource: IServerSideDatasource<Item> = {
    getRows: (params) => {
        const { startRow, endRow } = params.request;
        const changeData = (document.querySelector('#changeData') as HTMLInputElement).checked;
        // only first reads of a block change the data, so the grid's reloads of moved rows settle
        if (changeData && startRow! > 0 && !requestedBlocks.has(startRow!)) {
            changeServerData();
        }
        requestedBlocks.add(startRow!);

        const rows = serverRows.slice(startRow, endRow);
        const lastRow = serverRows.length;
        // simulate a server call
        setTimeout(() => params.success({ rowData: rows, rowCount: lastRow }), 300);
    },
};

let gridApi: GridApi<Item>;
const gridOptions: GridOptions<Item> = {
    columnDefs: [{ field: 'id' }, { field: 'name' }],
    defaultColDef: {
        flex: 1,
    },
    rowModelType: 'serverSide',
    cacheBlockSize: 10,
    maxConcurrentDatasourceRequests: 1,
    getRowId: (params: GetRowIdParams<Item>) => params.data.id,
    serverSideDatasource: levelDatasource,
    serverSideCheckLevelConsistency: true,
    onServerSideLevelInconsistent: (event: ServerSideLevelInconsistentEvent<Item>) => {
        console.log('Level inconsistent', event.route, event.inconsistencies);

        inconsistencyCount += event.inconsistencies.length;
        document.querySelector('#inconsistencyCount')!.textContent = String(inconsistencyCount);
        document.querySelector('#lastInconsistency')!.textContent = event.inconsistencies
            .map(({ type, boundaryIndex, rowIds }) =>
                type === 'duplicated'
                    ? `Rows ${rowIds.join(', ')} duplicated at row ${boundaryIndex}`
                    : `Rows dropped at row ${boundaryIndex}`
            )
            .join('; ');
    },
};

function reloadGrid() {
    requestedBlocks.clear();
    inconsistencyCount = 0;
    document.querySelector('#inconsistencyCount')!.textContent = '0';
    document.querySelector('#lastInconsistency')!.textContent = 'None';
    gridApi!.refreshServerSide({ purge: true });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

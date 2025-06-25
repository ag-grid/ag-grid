import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { Task } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    RowApiModule,
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function arrayEquals<T>(a: T[], b: T[]) {
    return a === b || (a.length === b.length && a.every((v, i) => v === b[i]));
}

// Rebuild the data array, updating the path for each node if changed
function extractRowData(api: GridApi<Task>) {
    const extractedData: Task[] = [];
    api.forEachLeafNode((node) => {
        const data = node.data;
        if (data) {
            // Use getRoute() to rebuild the path
            const path = node.getRoute() ?? [];
            if (!arrayEquals(data.path, path)) {
                // Create a new object only if the path has changed
                extractedData.push({ ...data, path });
            } else {
                extractedData.push(data);
            }
        }
    });
    return extractedData;
}

function showExtractedRowData(api: GridApi<Task>) {
    const extractedRowData = extractRowData(api);
    const json = JSON.stringify(extractedRowData, null, 2);
    document.getElementById('extracted-data-content')!.textContent = json;
}

const gridOptions: GridOptions<Task> = {
    columnDefs: [{ field: 'assignee' }],

    autoGroupColumnDef: {
        headerName: 'Task',
        rowDrag: true,
        flex: 2,
        minWidth: 200,
    },
    rowData: getData(),
    getRowId: (params) => params.data.id,
    treeData: true,
    getDataPath: (data) => data.path,
    groupDefaultExpanded: -1,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    onRowDragEnd: (event) => {
        showExtractedRowData(event.api);
    },
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;

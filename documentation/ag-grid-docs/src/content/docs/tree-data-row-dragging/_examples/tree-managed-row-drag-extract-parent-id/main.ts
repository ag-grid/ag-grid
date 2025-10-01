import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
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
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function extractRowData(api: GridApi<Task>) {
    const extractedData: Task[] = [];
    api.forEachLeafNode((node) => {
        let data = node.data!;
        const parentId = node.parent?.data?.id;
        if (data.parentId !== parentId) {
            // We create a new object only if the parentId has changed
            data = { ...data, parentId };
        }
        extractedData.push(data);
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
        field: 'title',
        rowDrag: true,
        flex: 2,
        minWidth: 200,
    },
    rowData: getData(),
    getRowId: (params) => params.data.id,
    treeData: true,
    treeDataParentIdField: 'parentId',
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

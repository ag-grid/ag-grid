import { array } from 'astro:schema';

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

/** Recursively build the tree structure from a node */
function buildTree(node: IRowNode<Task>): Task {
    const data = node.data!;
    const oldChildren = data.children ?? [];
    const children = node.childrenAfterGroup?.map(buildTree) ?? [];

    if (arrayEquals(oldChildren, children)) {
        return data; // unchanged
    }

    // We return a new object only if the children have changed
    return { ...data, children: children.length > 0 ? children : undefined };
}

/** Extract children for each node in the tree */
function extractChildren(api: GridApi<Task>) {
    const extractedData: Task[] = [];
    api.forEachNode((node) => {
        if (node.level === 0 && node.data) {
            extractedData.push(buildTree(node));
        }
    });
    return extractedData;
}

function exportDataCallback(api: GridApi<Task>) {
    const exportedData = extractChildren(api);
    const json = JSON.stringify(exportedData, null, 2);
    document.getElementById('exported-data-content')!.textContent = json;
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
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    rowDragManaged: true,
    rowDragInsertDelay: 500,
    suppressMoveWhenRowDragging: true,
    onRowDragEnd: (event) => {
        exportDataCallback(event.api);
    },
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;

// Initial export
exportDataCallback(gridApi);

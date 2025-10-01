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
    if (!arrayEquals(oldChildren, children)) {
        // We create a new object only if the children have changed
        return { ...data, children: children.length > 0 ? children : undefined };
    }
    return data; // unchanged
}

/** Extract children for each node in the tree */
function extractRowData(rootNode: IRowNode<Task> | undefined) {
    return rootNode?.childrenAfterGroup?.map(buildTree) ?? [];
}

function showExtractedRowData(rootNode: IRowNode<Task> | undefined) {
    const extractedRowData = extractRowData(rootNode);
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
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    onRowDragEnd: (event) => {
        showExtractedRowData(event.rowsDrop?.rootNode);
    },
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;

import type {
    CellClassParams,
    GridApi,
    GridOptions,
    ICellRendererParams,
    IRowNode,
    RefreshCellsParams,
    RowDragEndEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RenderApiModule,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { getFileCssIcon, moveFiles } from './fileUtils';
import type { IFile } from './fileUtils';

ModuleRegistry.registerModules([
    RowDragModule,
    ClientSideRowModelApiModule,
    RenderApiModule,
    CellStyleModule,
    ClientSideRowModelModule,
    TreeDataModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

class FileCellRenderer {
    private eGui!: any;

    init(params: ICellRendererParams<IFile>) {
        const eGui = document.createElement('div');

        const eIcon = document.createElement('i');
        eIcon.className = getFileCssIcon(params.data?.type, params.value);

        const eFilename = document.createElement('span');
        eFilename.className = 'filename';
        eFilename.innerText = params.value;

        eGui.appendChild(eIcon);
        eGui.appendChild(eFilename);

        this.eGui = eGui;
    }
    getGui() {
        return this.eGui;
    }
}

const valueFormatter = function (params: ValueFormatterParams) {
    return params.value ? params.value + ' MB' : '';
};

const cellClassRules = {
    'hover-over': (params: CellClassParams) => {
        return params.node === potentialParent;
    },
};

let gridApi: GridApi;

const gridOptions: GridOptions<IFile> = {
    columnDefs: [
        {
            field: 'dateModified',
            cellClassRules: cellClassRules,
        },
        {
            field: 'size',
            valueFormatter: valueFormatter,
            cellClassRules: cellClassRules,
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    rowData: getData(),
    treeData: true,
    groupDefaultExpanded: -1,
    getDataPath: (data: IFile) => data.filePath,
    getRowId: ({ data }) => data.id,
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Files',
        minWidth: 300,
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: FileCellRenderer,
        },
        cellClassRules: {
            'hover-over': (params) => {
                return params.node === potentialParent;
            },
        },
    },
    onRowDragEnd: onRowDragEnd,
    onRowDragMove: onRowDragMove,
    onRowDragLeave: onRowDragLeave,
};

var potentialParent: any = null;

function onRowDragMove(event: RowDragMoveEvent) {
    setPotentialParentForNode(event.api, event.overNode);
}

function onRowDragLeave(event: RowDragLeaveEvent) {
    // clear node to highlight
    setPotentialParentForNode(event.api, null);
}

function onRowDragEnd(event: RowDragEndEvent) {
    let target = event.overNode?.data;

    if (!potentialParent && target) {
        return; // no move
    }

    const source = event.node.data;
    const rowData = event.api.getGridOption('rowData');
    if (rowData && source && source !== target) {
        const newRowData = moveFiles(rowData, source, target);
        if (!newRowData) {
            console.log('invalid move');
        } else if (newRowData !== rowData) {
            event.api.setGridOption('rowData', newRowData);
        }
        gridApi!.clearFocusedCell();
    }

    // clear node to highlight
    setPotentialParentForNode(event.api, null);
}

function setPotentialParentForNode(api: GridApi<IFile>, overNode: IRowNode<IFile> | undefined | null) {
    let newPotentialParent: IRowNode<IFile> | null = null;

    if (overNode) {
        if (overNode.data?.type === 'folder') {
            // over a folder, we take the immediate row
            newPotentialParent = overNode;
        } else if (overNode.parent) {
            // over a file, we take the parent row (which will be a folder)
            newPotentialParent = overNode.parent;
        }
    }

    const alreadySelected = potentialParent === newPotentialParent;
    if (alreadySelected) {
        return; // no change
    }

    // we refresh the previous selection (if it exists) to clear
    // the highlighted and then the new selection.
    const rowsToRefresh = [];
    if (potentialParent) {
        rowsToRefresh.push(potentialParent);
    }
    if (newPotentialParent) {
        rowsToRefresh.push(newPotentialParent);
    }

    potentialParent = newPotentialParent;

    refreshRows(api, rowsToRefresh);
}

function refreshRows(api: GridApi, rowsToRefresh: IRowNode<IFile>[]) {
    const params: RefreshCellsParams<IFile> = {
        // refresh these rows only.
        rowNodes: rowsToRefresh,
        // because the grid does change detection, the refresh
        // will not happen because the underlying value has not
        // changed. to get around this, we force the refresh,
        // which skips change detection.
        force: true,
    };
    api.refreshCells(params);
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(eGridDiv, gridOptions);
});

import type { GetRowIdParams, GridApi, GridOptions, RowDragEndEvent, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { files } from './data';
import type { IFile } from './data';
import { getFileDropIndicator, moveRowNode } from './fileUtils';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowApiModule,
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IFile>;

function getRowId(params: GetRowIdParams<IFile>) {
    return params.data.id;
}

function onRowDragEnd(event: RowDragEndEvent<IFile>) {
    const source = event.node.data;
    const target = event.overNode?.data ?? null;
    if (!source || source === target) {
        gridApi.setRowDropPositionIndicator(null);
        return;
    }
    const asChild = target !== null && target.type === 'folder';
    const rowData = gridApi.getGridOption('rowData') ?? [];
    const newRowData = moveRowNode(rowData, source, target, asChild);
    if (newRowData !== rowData) {
        gridApi.setGridOption('rowData', newRowData);
    }
    gridApi.setRowDropPositionIndicator(null);
}

function onRowDragCancel() {
    gridApi.setRowDropPositionIndicator(null);
}

function onRowDragMove(event: any) {
    const indicator = getFileDropIndicator(event.node, event.overNode);
    gridApi.setRowDropPositionIndicator(indicator);
}

const gridOptions: GridOptions<IFile> = {
    columnDefs: [
        { field: 'dateModified' },
        {
            field: 'size',
            valueFormatter: (params: ValueFormatterParams) => (params.value ? params.value + ' MB' : ''),
        },
    ],
    autoGroupColumnDef: {
        rowDrag: true,
        field: 'name',
        headerName: 'Files',
        minWidth: 400,
        cellRendererParams: { suppressCount: true },
    },
    treeData: true,
    getRowId,
    rowData: files,
    animateRows: true,
    onRowDragEnd,
    onRowDragMove,
    onRowDragCancel,
    groupDefaultExpanded: -1,
};

gridApi = createGrid(document.getElementById('myGrid')!, gridOptions);

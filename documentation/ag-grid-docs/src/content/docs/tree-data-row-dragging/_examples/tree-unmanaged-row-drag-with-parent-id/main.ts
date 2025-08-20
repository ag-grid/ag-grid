import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragLeaveEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { getData } from './data';
import type { IFile } from './fileUtils';
import { getFileDropPosition, moveFiles } from './fileUtils';

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
    const target = event.overNode?.data;
    if (!source || source === target) {
        gridApi.setRowDropPositionIndicator(null);
        return;
    }
    const reorderOnly = event.event?.shiftKey;
    const rowData = gridApi.getGridOption('rowData') ?? [];
    const indicator = getFileDropPosition(rowData, source, target, !!reorderOnly);
    if (indicator) {
        const newRowData = moveFiles(rowData, indicator);
        if (newRowData !== rowData) {
            gridApi.setGridOption('rowData', newRowData);
        }
    }
    event.api.setRowDropPositionIndicator(null);
}

function onRowDragLeaveOrCancel(event: RowDragLeaveEvent<IFile> | RowDragCancelEvent<IFile>) {
    event.api.setRowDropPositionIndicator(null);
}

function onRowDragMove(event: any) {
    const source = event.node.data;
    const target = event.overNode?.data;
    const reorderOnly = event.event?.shiftKey;
    const rowData = gridApi.getGridOption('rowData') ?? [];
    const indicator = getFileDropPosition(rowData, source, target, !!reorderOnly);

    if (indicator) {
        // Find the row node by file reference
        const rowNode = gridApi.getRowNode(indicator.target.id);
        if (rowNode) {
            // Update the position indicator
            gridApi.setRowDropPositionIndicator({
                row: rowNode,
                dropIndicatorPosition: indicator.position,
            });

            return;
        }
    }

    gridApi.setRowDropPositionIndicator(null);
}

const gridOptions: GridOptions<IFile> = {
    columnDefs: [
        {
            field: 'type',
            headerName: 'Type',
            width: 90,
        },
        {
            field: 'dateModified',
            headerName: 'Modified',
            width: 130,
        },
        {
            field: 'size',
            aggFunc: 'sum',
            width: 140,
            valueFormatter: (params: ValueFormatterParams<IFile, number>) =>
                params.value ? params.value.toFixed(1) + ' MB' : '',
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
    treeDataParentIdField: 'parentId',
    rowData: getData(),
    animateRows: true,
    onRowDragEnd,
    onRowDragMove,
    onRowDragLeave: onRowDragLeaveOrCancel,
    onRowDragCancel: onRowDragLeaveOrCancel,
    groupDefaultExpanded: -1,
};

gridApi = createGrid(document.getElementById('myGrid')!, gridOptions);

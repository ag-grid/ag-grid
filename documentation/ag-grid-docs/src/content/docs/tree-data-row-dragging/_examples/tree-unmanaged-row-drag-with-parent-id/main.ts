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

import { getData } from './data';
import type { FileDropIndicator, IFile } from './fileUtils';
import { getFileDropIndicator, moveFiles } from './fileUtils';

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
    const newRowData = moveFiles(rowData, source, target, !!reorderOnly);
    if (newRowData !== rowData) {
        gridApi.setGridOption('rowData', newRowData);
    }
    gridApi.setRowDropPositionIndicator(null);
}

function onRowDragCancel() {
    gridApi.setRowDropPositionIndicator(null);
}

function onRowDragMove(event: any) {
    const source = event.node.data;
    const target = event.overNode?.data;
    const reorderOnly = event.event?.shiftKey;
    const rowData = gridApi.getGridOption('rowData') ?? [];
    const indicator: FileDropIndicator | null = getFileDropIndicator(rowData, source, target, !!reorderOnly);
    if (indicator) {
        // Find the row node by file reference
        let rowNode = null;
        gridApi.forEachNode((node) => {
            if (node.data === indicator.file) {
                rowNode = node;
            }
        });
        if (rowNode) {
            gridApi.setRowDropPositionIndicator({
                row: rowNode,
                dropIndicatorPosition: indicator.dropIndicatorPosition,
            });
        } else {
            gridApi.setRowDropPositionIndicator(null);
        }
    } else {
        gridApi.setRowDropPositionIndicator(null);
    }
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
            valueFormatter: (params: ValueFormatterParams) => (params.value ? params.value + ' MB' : ''),
            width: 140,
            aggFunc: 'sum',
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
    onRowDragCancel,
    groupDefaultExpanded: -1,
};

gridApi = createGrid(document.getElementById('myGrid')!, gridOptions);

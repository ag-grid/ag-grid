'use client';

import React, { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    ValidationModule,
} from 'ag-grid-community';
import type {
    GridOptions,
    RowDragEndEvent,
    RowDragEvent,
    RowDragMoveEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import type { IFile } from './fileUtils';
import { getFileDropPosition, moveFiles } from './fileUtils';
import './style.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowApiModule,
    RowDragModule,
    TreeDataModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const STATIC_GRID_OPTIONS: GridOptions<IFile> = {
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
    getRowId: (params) => params.data.id,
    treeDataParentIdField: 'parentId',
    rowData: getData(),
    animateRows: true,
    groupDefaultExpanded: -1,
};

const DragAndDropGrid = () => {
    const [rowData, setRowData] = useState<IFile[]>(getData());
    const gridRef = React.useRef<AgGridReact<IFile> | null>(null);

    const onRowDragMove = useCallback(
        (event: RowDragMoveEvent<IFile>) => {
            const source = event.node.data;
            const target = event.overNode?.data;
            const reorderOnly = event.event?.shiftKey;
            const position = getFileDropPosition(rowData, source, target, !!reorderOnly);
            event.api.setRowDropPositionIndicator({
                row: position?.target && event.api.getRowNode(position.target.id),
                dropIndicatorPosition: position?.position || 'none',
            });
        },
        [rowData]
    );

    const onRowDragEnd = useCallback(
        (event: RowDragEndEvent<IFile>) => {
            const source = event.node.data;
            const target = event.overNode?.data;
            const reorderOnly = event.event?.shiftKey;
            const position = getFileDropPosition(rowData, source, target, !!reorderOnly);
            if (position) {
                const newRowData = moveFiles(rowData, position);
                setRowData(newRowData);
            }
            event.api.setRowDropPositionIndicator(null);
        },
        [rowData]
    );

    const onRowDragCancel = useCallback((event: RowDragEvent<IFile>) => {
        event.api.setRowDropPositionIndicator(null);
    }, []);

    return (
        <AgGridReact<IFile>
            ref={gridRef}
            gridOptions={STATIC_GRID_OPTIONS}
            rowData={rowData}
            onRowDragMove={onRowDragMove}
            onRowDragEnd={onRowDragEnd}
            onRowDragCancel={onRowDragCancel}
        />
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <div className="myGrid">
            <DragAndDropGrid />
        </div>
    </StrictMode>
);

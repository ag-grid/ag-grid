'use client';

import React, { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    ValidationModule,
} from 'ag-grid-community';
import type { GridOptions, RowDragEndEvent, RowDragEnterEvent, RowDragMoveEvent } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import FileCellRenderer from './fileCellRenderer';
import { type IFile, moveFiles } from './fileUtils';
import './style.css';

ModuleRegistry.registerModules([
    RowDragModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    TreeDataModule,
    ValidationModule /* Development Only */,
]);

interface MyGridContext {
    /** The original row data before dragging started */
    rowDataDragging: IFile[] | null | undefined;
}

const STATIC_GRID_OPTIONS: GridOptions<IFile> = {
    columnDefs: [
        { field: 'dateModified' },
        {
            field: 'size',
            valueFormatter: (params) => (params.value ? params.value + ' MB' : ''),
        },
    ],
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Files',
        minWidth: 300,
        cellRendererParams: { suppressCount: true, innerRenderer: FileCellRenderer },
    },
    defaultColDef: { flex: 1 },
    groupDefaultExpanded: -1,
    treeData: true,
    getDataPath: (data: IFile): string[] => data.filePath,
    getRowId: (params): string => params.data.id,
};

const DragAndDropGrid = () => {
    const [rowData, setRowData] = useState<any[]>(getData);

    /** Called when row dragging start */
    const rowDragEnter = useCallback(
        (event: RowDragEnterEvent<IFile, MyGridContext>) => {
            // Store the original row data to restore it the drag is cancelled in a custom property in the context
            event.context.rowDataDragging = rowData;
        },
        [rowData]
    );

    // /** Called both when dragging and dropping */
    const rowDragOrDrop = useCallback(
        (event: RowDragMoveEvent<IFile, MyGridContext> | RowDragEndEvent<IFile, MyGridContext>) => {
            let target = event.overNode?.data;
            const source = event.node.data;
            if (rowData && source && source !== target) {
                const reorderOnly = event.event?.shiftKey;
                const newRowData = moveFiles(rowData, source, target, reorderOnly);
                setRowData(newRowData);
            }
        },
        [rowData]
    );

    const rowDragEnd = useCallback(
        (event: RowDragEndEvent<IFile, MyGridContext>) => {
            event.api.clearFocusedCell();
            event.context.rowDataDragging = null;
            rowDragOrDrop(event);
        },
        [rowDragOrDrop]
    );

    return (
        <AgGridReact<IFile>
            gridOptions={STATIC_GRID_OPTIONS}
            rowData={rowData}
            onRowDragEnter={rowDragEnter}
            onRowDragMove={rowDragOrDrop}
            onRowDragEnd={rowDragEnd}
        />
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <div id="myGrid">
            <DragAndDropGrid />
        </div>
    </StrictMode>
);

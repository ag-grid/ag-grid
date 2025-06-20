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
import type { GridOptions, RowDragEndEvent, RowDragMoveEvent } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import FileCellRenderer from './fileCellRenderer';
import { type IFile, moveFiles } from './fileUtils';
import './style.css';

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    RowDragModule,
    TreeDataModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

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
    // The row data is stored in a state variable
    const [rowData, setRowData] = useState<any[]>(getData);

    // This will store a copy of rowData to perform cancel operation when user presses ESC while dragging
    const [rowDataDragging, setRowDataDragging] = useState<IFile[] | null>(null);

    /** Called when row dragging start */
    const onRowDragEnter = useCallback(() => {
        // Store the original row data to restore it the drag is cancelled in a custom property in the context
        setRowDataDragging(rowData);
    }, [rowData]);

    /** Called both when dragging and dropping (drag end) */
    const onRowDragMove = useCallback(
        (event: RowDragMoveEvent<IFile> | RowDragEndEvent<IFile>) => {
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

    /** Called when row dragging end, and the operation need to be committed */
    const onRowDragEnd = useCallback(
        (event: RowDragEndEvent<IFile>) => {
            event.api.clearFocusedCell();
            setRowDataDragging(null);
            onRowDragMove(event);
        },
        [onRowDragMove]
    );

    /** Called when row dragging is cancelled, for example, ESC key is pressed */
    const onRowDragCancel = useCallback(() => {
        if (rowDataDragging) {
            // Restore the original row data before the drag started
            setRowData(rowDataDragging);
            setRowDataDragging(null);
        }
    }, [rowDataDragging]);

    return (
        <AgGridReact<IFile>
            gridOptions={STATIC_GRID_OPTIONS}
            rowData={rowData}
            onRowDragEnter={onRowDragEnter}
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

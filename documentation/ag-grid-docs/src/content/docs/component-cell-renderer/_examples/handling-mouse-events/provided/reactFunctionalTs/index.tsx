'use client';

import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    type CellClickedEvent,
    type CellDoubleClickedEvent,
    type CellMouseDownEvent,
    ClientSideRowModelModule,
    ColDef,
    EventCellRendererParams,
    ModuleRegistry,
    NumberEditorModule,
    type RowClickedEvent,
    type RowDoubleClickedEvent,
    RowSelectionModule,
    RowSelectionOptions,
    SuppressMouseEventHandlingParams,
    TextEditorModule,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import CustomButtonComponent from './customButtonComponent';
import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CellSelectionModule,
    RowSelectionModule,
    TextEditorModule,
    NumberEditorModule,
]);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    const defaultColDef = useMemo(
        () => ({
            editable: true,
        }),
        []
    );
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: 'id',
        },
        {
            colId: 'customButton',
            headerName: 'Button',
            cellRenderer: CustomButtonComponent,
            cellRendererParams: {
                suppressMouseEventHandling: (params: SuppressMouseEventHandlingParams) => {
                    console.log('suppressMouseEventHandling', params);
                    return true;
                },
            } as EventCellRendererParams,
        },
    ]);

    const [cellSelection, setCellSelection] = useState<boolean>();
    const [rowSelection, setRowSelection] = useState<RowSelectionOptions>();

    const toggleCellSelection = useCallback(() => {
        setCellSelection((prev) => !prev);
    }, []);

    const toggleRowSelection = useCallback(() => {
        setRowSelection((prev) =>
            prev
                ? undefined
                : {
                      mode: 'multiRow',
                      enableClickSelection: true,
                  }
        );
    }, []);
    const onMouseEvent = useCallback(
        (
            e: CellClickedEvent | CellDoubleClickedEvent | CellMouseDownEvent | RowClickedEvent | RowDoubleClickedEvent
        ) => {
            console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
        },
        []
    );

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button onClick={toggleCellSelection}>{cellSelection ? 'Disable' : 'Enable'} Cell Selection</button>
                    <button onClick={toggleRowSelection}>{rowSelection ? 'Disable' : 'Enable'} Row Selection</button>
                </div>

                <div style={gridStyle}>
                    <AgGridReact
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        cellSelection={cellSelection}
                        rowSelection={rowSelection}
                        onCellClicked={onMouseEvent}
                        onCellMouseDown={onMouseEvent}
                        onCellDoubleClicked={onMouseEvent}
                        onRowClicked={onMouseEvent}
                        onRowDoubleClicked={onMouseEvent}
                    />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

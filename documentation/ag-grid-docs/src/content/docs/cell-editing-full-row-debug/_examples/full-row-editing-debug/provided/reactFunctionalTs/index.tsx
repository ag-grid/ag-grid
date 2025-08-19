import React from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

const { StrictMode, useCallback, useMemo, useRef, useState } = React;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SelectEditorModule,
    TextEditorModule,
    NumberEditorModule,
    CustomEditorModule,
    ColumnApiModule,
    RenderApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function getRowData(): any[] {
    const rowData: any[] = [];
    for (let i = 0; i < 1000; i++) {
        rowData.push({
            make: 'Toyota',
            model: 'Celica',
            price: 35000 + i * 1000,
            field4: 'Sample XX',
            field5: 'Sample 22',
            field6: 'Sample 23',
        });
        rowData.push({
            make: 'Ford',
            model: 'Mondeo',
            price: 32000 + i * 1000,
            field4: 'Sample YY',
            field5: 'Sample 24',
            field6: 'Sample 25',
        });
        rowData.push({
            make: 'Porsche',
            model: 'Boxster',
            price: 72000 + i * 1000,
            field4: 'Sample ZZ',
            field5: 'Sample 26',
            field6: 'Sample 27',
        });
    }
    return rowData;
}

function getColumnDefs() {
    const columnDefs = [
        {
            field: 'make',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'],
            },
        },
        { field: 'model' },
        { field: 'field4', headerName: 'Read Only', editable: false },
        { field: 'price', cellEditor: 'agNumberCellEditor' },
        {
            headerName: 'Suppress Navigable',
            field: 'field5',
            suppressNavigable: true,
            minWidth: 200,
        },
        { headerName: 'Read Only', field: 'field6', editable: false },
    ];

    const bigColDefs = [...Array(2)]
        .map(() => columnDefs.map((c, i) => ({ ...c, colId: `${c.field}-${i}` })))
        .reduce((a, c) => [...a, ...c])
        .map((c, i) => ({ ...c, colId: `${c.colId}-${i}` }));

    return bigColDefs;
}

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getRowData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>(getColumnDefs());
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            editable: true,
            cellDataType: false,
            minWidth: 100,
        };
    }, []);

    const onBtStopEditing = useCallback(() => {
        gridRef.current!.api.stopEditing();
    }, []);

    const onBtStartEditing = useCallback(() => {
        gridRef.current!.api.setFocusedCell(1, 'model-1-1');
        gridRef.current!.api.startEditingCell({
            rowIndex: 1,
            colKey: 'model-1-1',
        });
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button style={{ fontSize: '12px' }} onClick={onBtStartEditing}>
                        Start Editing Line 2
                    </button>
                    <button style={{ fontSize: '12px' }} onClick={onBtStopEditing}>
                        Stop Editing
                    </button>
                </div>
                <div style={gridStyle}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
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

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, EditableCallbackParams, GetRowIdParams, RowEditingStoppedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';

ModuleRegistry.registerModules([
    ColumnApiModule,
    ClientSideRowModelModule,
    TextEditorModule,
    NumberEditorModule,
    PinnedRowModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { headerName: 'Symbol', field: 'symbol' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Group', field: 'group' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 250,
            editable: (params: EditableCallbackParams) => {
                return params.node.id === 'new-row';
            },
        };
    }, []);

    const getRowId = useCallback(function (params: GetRowIdParams) {
        return params.data.symbol ?? 'new-row';
    }, []);

    const addNewRow = useCallback(() => {
        const { api } = gridRef.current || {};

        if (!api) {
            return;
        }

        api.setGridOption('pinnedBottomRowData', [{ symbol: null, price: null, group: null }]);
        setTimeout(() => {
            api.startEditingCell({ rowIndex: 0, rowPinned: 'bottom', colKey: 'symbol' });
        });
    }, []);

    const onRowEditingStopped = useCallback(
        (params: RowEditingStoppedEvent) => {
            const { data } = params;

            setPinnedBottomRowData([]);

            if (data.symbol == null) {
                return;
            }

            setRowData([data, ...rowData]);
        },
        [rowData]
    );

    return (
        <div style={containerStyle}>
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div>
                    <div style={{ marginBottom: '5px', minHeight: '30px' }}>
                        <button onClick={addNewRow}>Add New Row</button>
                    </div>
                </div>
                <div style={{ flex: '1 1 0px' }}>
                    <div style={gridStyle}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            editType={'fullRow'}
                            getRowId={getRowId}
                            pinnedBottomRowData={pinnedBottomRowData}
                            onRowEditingStopped={onRowEditingStopped}
                        />
                    </div>
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

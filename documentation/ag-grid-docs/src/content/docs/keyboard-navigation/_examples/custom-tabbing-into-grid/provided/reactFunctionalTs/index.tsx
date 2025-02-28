import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    CellFocusedParams,
    ColDef,
    Column,
    ColumnGroup,
    FocusGridInnerElementParams,
    GridApi,
    HeaderFocusedParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

const GridExample = () => {
    const [lastFocused, setLastFocused] = useState<
        { column: string | Column | ColumnGroup | null; rowIndex?: number | null } | undefined
    >();

    const columnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: '#',
                colId: 'rowNum',
                valueGetter: 'node.id',
            },
            {
                field: 'athlete',
                minWidth: 170,
            },
            { field: 'age' },
            { field: 'country' },
            { field: 'year' },
            { field: 'date' },
            { field: 'sport' },
            { field: 'gold' },
            { field: 'silver' },
            { field: 'bronze' },
            { field: 'total' },
        ],
        []
    );

    const { data, loading } = useFetchJson<IOlympicData>('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const onCellFocused = (params: CellFocusedParams) => {
        setLastFocused({ column: params.column, rowIndex: params.rowIndex });
    };

    const onHeaderFocused = (params: HeaderFocusedParams) => {
        setLastFocused({ column: params.column, rowIndex: null });
    };

    const focusGridInnerElement = (params: FocusGridInnerElementParams) => {
        if (!lastFocused || !lastFocused.column) {
            return false;
        }

        if (lastFocused.rowIndex != null) {
            params.api.setFocusedCell(lastFocused.rowIndex, lastFocused.column as Column | string);
        } else {
            params.api.setFocusedHeader(lastFocused.column);
        }

        return true;
    };

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div>
                    <div className="form-container">
                        <label>Input Above</label>
                        <input type="text" />
                    </div>
                </div>
                <div id="myGrid" style={{ height: '100%', width: '100%' }}>
                    <AgGridReact
                        rowData={data}
                        loading={loading}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onCellFocused={onCellFocused}
                        onHeaderFocused={onHeaderFocused}
                        focusGridInnerElement={focusGridInnerElement}
                    />
                </div>
                <div className="form-container">
                    <label>Input Below</label>
                    <input type="text" />
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

'use client';

import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ColDef,
    FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridReadyEvent,
} from 'ag-grid-community';
import { ClientSideRowModelModule, RowApiModule, ValidationModule } from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import DetailCellRenderer from './detailCellRenderer';
import './styles.css';

const modules = [
    FindModule,
    ToolbarModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [columnDefs] = useState<ColDef[]>([
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
    ]);

    const detailCellRenderer = useMemo(() => DetailCellRenderer, []);

    const detailCellRendererParams = useMemo<FindDetailCellRendererParams>(
        () => ({
            getFindMatches: (params: GetFindMatchesParams) => {
                return params.getMatchesForValue('My Custom Detail');
            },
        }),
        []
    );

    const findOptions = useMemo<FindOptions>(
        () => ({
            searchDetail: true,
        }),
        []
    );

    const toolbar = useMemo(() => ({ items: ['agFindToolbarItem' as const] }), []);

    const goToRef = useRef<HTMLInputElement>(null);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    }, []);

    const goToFind = useCallback(() => {
        const num = Number(goToRef.current?.value);
        if (isNaN(num) || num < 0) {
            return;
        }
        gridRef.current!.api.findGoTo(num);
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <div className="example-controls">
                        <span>Go to match:</span>
                        <input type="number" ref={goToRef} />
                        <button onClick={goToFind}>Go To</button>
                    </div>
                </div>

                <div style={gridStyle}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        masterDetail
                        detailCellRenderer={detailCellRenderer}
                        detailCellRendererParams={detailCellRendererParams}
                        detailRowHeight={100}
                        findOptions={findOptions}
                        toolbar={toolbar}
                        modules={modules}
                        onGridReady={onGridReady}
                        onFirstDataRendered={onFirstDataRendered}
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

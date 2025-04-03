'use client';

import React, { type ChangeEvent, type KeyboardEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridReadyEvent,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import DetailCellRenderer from './detailCellRenderer';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
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

    const goToRef = useRef<HTMLInputElement>(null);

    const [findSearchValue, setFindSearchValue] = useState<string>();

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        setActiveMatchNum(findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '');
    }, []);

    const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    }, []);

    const onInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setFindSearchValue(event.target.value);
    }, []);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const backwards = event.shiftKey;
            if (backwards) {
                previous();
            } else {
                next();
            }
        }
    }, []);

    const next = useCallback(() => {
        gridRef.current!.api.findNext();
    }, []);

    const previous = useCallback(() => {
        gridRef.current!.api.findPrevious();
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
                        <span>Find:</span>
                        <input type="text" onInput={onInput} onKeyDown={onKeyDown} />
                        <button onClick={previous}>Previous</button>
                        <button onClick={next}>Next</button>
                        <span>{activeMatchNum}</span>
                    </div>
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
                        findSearchValue={findSearchValue}
                        findOptions={findOptions}
                        onGridReady={onGridReady}
                        onFindChanged={onFindChanged}
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

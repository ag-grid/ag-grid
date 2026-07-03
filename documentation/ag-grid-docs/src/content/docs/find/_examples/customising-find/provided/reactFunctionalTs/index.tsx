'use client';

import React, { ChangeEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, FindChangedEvent, FindOptions, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, PinnedRowModule, enableDevValidations } from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [
    FindModule,
    ToolbarModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const pinnedTopRowData = useMemo<any[]>(() => {
        return [{ athlete: 'Top' }];
    }, []);
    const pinnedBottomRowData = useMemo<any[]>(() => {
        return [{ athlete: 'Bottom' }];
    }, []);
    const [columnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ]);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            enableRowGroup: true,
        };
    }, []);
    const paginationPageSizeSelector = useMemo<number[] | boolean>(() => {
        return [5, 10];
    }, []);
    const [findOptions, setFindOptions] = useState<FindOptions>({
        caseSensitive: true,
        currentPageOnly: true,
    });

    const toolbar = useMemo(
        () => ({ items: ['agRowGroupPanelToolbarItem' as const, 'agFindToolbarItem' as const] }),
        []
    );

    const goToRef = useRef<HTMLInputElement>(null);

    const [activeMatch, setActiveMatch] = useState<string>();

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch } = event;
        setActiveMatch(
            activeMatch
                ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column?.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
                : ''
        );
    }, []);

    const goToFind = useCallback(() => {
        const num = Number(goToRef.current?.value);
        if (isNaN(num) || num < 0) {
            return;
        }
        gridRef.current!.api.findGoTo(num);
    }, []);

    const toggleCaseSensitive = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const caseSensitive = event.target.checked;
        setFindOptions((oldFindOptions) => ({
            ...oldFindOptions,
            caseSensitive,
        }));
    }, []);

    const toggleCurrentPageOnly = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const currentPageOnly = event.target.checked;
        setFindOptions((oldFindOptions) => ({
            ...oldFindOptions,
            currentPageOnly,
        }));
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div className="example-header">
                        <div className="example-controls">
                            <label>
                                <span>caseSensitive:</span>
                                <input
                                    id="caseSensitive"
                                    type="checkbox"
                                    onChange={toggleCaseSensitive}
                                    checked={findOptions.caseSensitive}
                                />
                            </label>
                            <label>
                                <span>currentPageOnly:</span>
                                <input
                                    id="currentPageOnly"
                                    type="checkbox"
                                    onChange={toggleCurrentPageOnly}
                                    checked={findOptions.currentPageOnly}
                                />
                            </label>
                        </div>
                        <div className="example-controls">
                            <span>Go to match:</span>
                            <input type="number" ref={goToRef} />
                            <button onClick={goToFind}>Go To</button>
                        </div>
                        <div>{activeMatch}</div>
                    </div>

                    <div style={gridStyle}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            pinnedTopRowData={pinnedTopRowData}
                            pinnedBottomRowData={pinnedBottomRowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={5}
                            paginationPageSizeSelector={paginationPageSizeSelector}
                            toolbar={toolbar}
                            findOptions={findOptions}
                            onGridReady={onGridReady}
                            onFindChanged={onFindChanged}
                        />
                    </div>
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

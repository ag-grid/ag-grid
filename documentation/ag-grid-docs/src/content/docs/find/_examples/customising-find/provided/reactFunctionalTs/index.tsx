'use client';

import React, { ChangeEvent, KeyboardEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindOptions,
    GridReadyEvent,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
    ValidationModule /* Development Only */,
]);

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
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
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

    const goToRef = useRef<HTMLInputElement>(null);

    const [findSearchValue, setFindSearchValue] = useState<string>();

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

    const [activeMatch, setActiveMatch] = useState<string>();

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        setActiveMatchNum(findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '');
        setActiveMatch(
            activeMatch
                ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
                : ''
        );
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
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <div className="example-controls">
                        <label>
                            <span>caseSensitive:</span>
                            <input id="caseSensitive" type="checkbox" onChange={toggleCaseSensitive} checked />
                        </label>
                        <label>
                            <span>currentPageOnly:</span>
                            <input id="currentPageOnly" type="checkbox" onChange={toggleCurrentPageOnly} checked />
                        </label>
                    </div>
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
                        rowGroupPanelShow={'always'}
                        pagination={true}
                        paginationPageSize={5}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                        findSearchValue={findSearchValue}
                        findOptions={findOptions}
                        onGridReady={onGridReady}
                        onFindChanged={onFindChanged}
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

'use client';

import React, { type ChangeEvent, type KeyboardEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GridReadyEvent,
    ModuleRegistry,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ]);

    const goToRef = useRef<HTMLInputElement>(null);

    const [findSearchValue, setFindSearchValue] = useState<string>();

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        setActiveMatchNum(findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '');
        console.log('findChanged', event);
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
                        findSearchValue={findSearchValue}
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

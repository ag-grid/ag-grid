'use client';

import React, { type ChangeEvent, type KeyboardEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowHeightParams,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData, getLatinText } from './data';
import FullWidthCellRenderer from './fullWidthCellRenderer';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'name' },
        { field: 'continent' },
        { field: 'language' },
    ]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
        }),
        []
    );

    const isFullWidth = useCallback((data: any) => {
        // return true when country is Peru, France or Italy
        return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
    }, []);

    const getRowHeight = useCallback((params: RowHeightParams) => {
        // return 100px height for full width rows
        if (isFullWidth(params.data)) {
            return 100;
        }
    }, []);

    const isFullWidthRow = useCallback((params: IsFullWidthRowParams) => {
        return isFullWidth(params.rowNode.data);
    }, []);

    const fullWidthCellRenderer = useMemo(() => FullWidthCellRenderer, []);

    const fullWidthCellRendererParams = useMemo<FindFullWidthCellRendererParams>(
        () => ({
            getFindMatches: (params: GetFindMatchesParams) => {
                const getMatchesForValue = params.getMatchesForValue;
                // this example only implements searching across part of the renderer
                let numMatches = getMatchesForValue('Sample Text in a Paragraph');
                getLatinText().forEach((paragraph) => {
                    numMatches += getMatchesForValue(paragraph);
                });
                return numMatches;
            },
        }),
        []
    );

    const goToRef = useRef<HTMLInputElement>(null);

    const [findSearchValue, setFindSearchValue] = useState<string>();

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        setActiveMatchNum(findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '');
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
                        defaultColDef={defaultColDef}
                        getRowHeight={getRowHeight}
                        isFullWidthRow={isFullWidthRow}
                        fullWidthCellRenderer={fullWidthCellRenderer}
                        fullWidthCellRendererParams={fullWidthCellRendererParams}
                        findSearchValue={findSearchValue}
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

'use client';

import React, { type ChangeEvent, type KeyboardEvent, StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindOptions,
    FirstDataRenderedEvent,
    type GetDetailRowDataParams,
    type GetFindMatchesParams,
    GetRowIdParams,
    IDetailCellRendererParams,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ValidationModule /* Development Only */,
]);

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'a1', cellRenderer: 'agGroupCellRenderer' },
        { field: 'b1' },
    ]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
        }),
        []
    );

    const getRowId = useCallback((params: GetRowIdParams) => params.data.a1, []);

    const getFindMatches = useCallback((params: GetFindMatchesParams) => {
        const getMatchesForValue = params.getMatchesForValue;
        let numMatches = 0;
        const checkRow = (row: any) => {
            for (const key of Object.keys(row)) {
                if (key === 'children') {
                    row.children.forEach((child: any) => checkRow(child));
                } else {
                    numMatches += getMatchesForValue(row[key]);
                }
            }
        };
        params.data.children.forEach(checkRow);
        return numMatches;
    }, []);

    const detailCellRendererParams = useMemo<Partial<IDetailCellRendererParams>>(
        () => ({
            // level 2 grid options
            detailGridOptions: {
                columnDefs: [{ field: 'a2', cellRenderer: 'agGroupCellRenderer' }, { field: 'b2' }],
                defaultColDef: {
                    flex: 1,
                },
                masterDetail: true,
                detailRowHeight: 240,
                getRowId: (params: GetRowIdParams) => params.data.a2,
                findOptions: {
                    searchDetail: true,
                },
                detailCellRendererParams: {
                    // level 3 grid options
                    detailGridOptions: {
                        columnDefs: [{ field: 'a3', cellRenderer: 'agGroupCellRenderer' }, { field: 'b3' }],
                        defaultColDef: {
                            flex: 1,
                        },
                        getRowId: (params: GetRowIdParams) => params.data.a3,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        params.successCallback(params.data.children);
                    },
                    getFindMatches,
                } as IDetailCellRendererParams,
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                params.successCallback(params.data.children);
            },
            getFindMatches,
        }),
        []
    );

    const goToRef = useRef<HTMLInputElement>(null);

    const findOptions = useMemo<FindOptions>(
        () => ({
            searchDetail: true,
        }),
        []
    );

    const [findSearchValue, setFindSearchValue] = useState<string>();

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

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
                        defaultColDef={defaultColDef}
                        masterDetail
                        getRowId={getRowId}
                        detailCellRendererParams={detailCellRendererParams}
                        findOptions={findOptions}
                        findSearchValue={findSearchValue}
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

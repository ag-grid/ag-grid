'use client';

import React, {
    type ChangeEvent,
    type KeyboardEventHandler,
    StrictMode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, FindChangedEvent, GetFindTextParams, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import FindRenderer from './findRenderer';
import './styles.css';

const modules = [
    FindModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete' },
        { field: 'country' },
        {
            field: 'year',
            cellRenderer: FindRenderer,
            getFindText: (params: GetFindTextParams) => {
                const cellValue = params.getValueFormatted() ?? params.value?.toString();
                if (!cellValue?.length) {
                    return null;
                }
                return `Year is ${cellValue}`;
            },
        },
    ]);

    const [findSearchValue, setFindSearchValue] = useState<string>('e');

    const [activeMatchNum, setActiveMatchNum] = useState<string>();

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: any[]) => setRowData(data));
    }, []);

    const onFindChanged = useCallback((event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        setActiveMatchNum(findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '');
    }, []);

    const onFirstDataRendered = useCallback(() => {
        next();
    }, []);

    const onInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setFindSearchValue(event.target.value);
    }, []);

    const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>((event) => {
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

    return (
        <AgGridProvider modules={modules}>
            <div style={containerStyle}>
                <div className="example-wrapper">
                    <div className="example-header">
                        <div className="example-controls">
                            <span>Find:</span>
                            <input type="text" defaultValue="e" onInput={onInput} onKeyDown={onKeyDown} />
                            <button onClick={previous}>Previous</button>
                            <button onClick={next}>Next</button>
                            <span>{activeMatchNum}</span>
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
                            onFirstDataRendered={onFirstDataRendered}
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

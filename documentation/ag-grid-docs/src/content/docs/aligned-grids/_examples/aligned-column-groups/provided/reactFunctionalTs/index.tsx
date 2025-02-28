import React, { StrictMode, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, ColGroupDef, FirstDataRenderedEvent, SizeColumnsToFitGridStrategy } from 'ag-grid-community';
import {
    AlignedGridsModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    TextFilterModule,
    ColumnAutoSizeModule,
    ColumnApiModule,
    AlignedGridsModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

const GridExample = () => {
    const topGridRef = useRef<AgGridReact>(null);
    const bottomGridRef = useRef<AgGridReact>(null);

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            flex: 1,
            minWidth: 120,
        }),
        []
    );

    const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
        () => [
            {
                headerName: 'Group 1',
                groupId: 'Group1',
                children: [
                    { field: 'athlete', pinned: true },
                    { field: 'age', pinned: true, columnGroupShow: 'open' },
                    { field: 'country' },
                    { field: 'year', columnGroupShow: 'open' },
                    { field: 'date' },
                    { field: 'sport', columnGroupShow: 'open' },
                ],
            },
            {
                headerName: 'Group 2',
                groupId: 'Group2',
                children: [
                    { field: 'athlete', pinned: true },
                    { field: 'age', pinned: true, columnGroupShow: 'open' },
                    { field: 'country' },
                    { field: 'year', columnGroupShow: 'open' },
                    { field: 'date' },
                    { field: 'sport', columnGroupShow: 'open' },
                ],
            },
        ],
        []
    );

    const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );

    const { data, loading } = useFetchJson('https://www.ag-grid.com/example-assets/olympic-winners.json');

    const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
        // mix up some columns
        params.api.moveColumnByIndex(11, 4);
        params.api.moveColumnByIndex(11, 4);
    };

    return (
        <div className="container">
            <div className="grid">
                <AgGridReact
                    ref={topGridRef}
                    rowData={data}
                    loading={loading}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onFirstDataRendered={onFirstDataRendered}
                    alignedGrids={[bottomGridRef]}
                    autoSizeStrategy={autoSizeStrategy}
                />
            </div>

            <div className="divider"></div>

            <div className="grid">
                <AgGridReact
                    ref={bottomGridRef}
                    rowData={data}
                    loading={loading}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    alignedGrids={[topGridRef]}
                />
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

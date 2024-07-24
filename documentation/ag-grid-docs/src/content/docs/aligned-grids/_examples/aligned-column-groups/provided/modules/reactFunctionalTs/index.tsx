import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    ColGroupDef,
    FirstDataRenderedEvent,
    GridReadyEvent,
    ModuleRegistry,
    SizeColumnsToFitGridStrategy,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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

    const [rowData, setRowData] = useState<any[]>([]);

    const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );

    const onGridReady = (params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
    };

    const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
        // mix up some columns
        params.api.moveColumnByIndex(11, 4);
        params.api.moveColumnByIndex(11, 4);
    };

    return (
        <div className="container">
            <div
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement?.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={topGridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    onFirstDataRendered={onFirstDataRendered}
                    alignedGrids={[bottomGridRef]}
                    autoSizeStrategy={autoSizeStrategy}
                />
            </div>

            <div className="divider"></div>

            <div
                className={
                    'grid ' +
                    /** DARK MODE START **/ (document.documentElement?.dataset.defaultTheme ||
                        'ag-theme-quartz') /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={bottomGridRef}
                    rowData={rowData}
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

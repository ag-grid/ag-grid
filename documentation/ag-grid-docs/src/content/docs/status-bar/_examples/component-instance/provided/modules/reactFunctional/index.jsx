'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact, getInstance } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import ClickableStatusBarComponent from './clickableStatusBarComponent.jsx';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, StatusBarModule, RangeSelectionModule]);

const rowSelection = {
    mode: 'multiRow',
};

const GridExample = () => {
    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '90%', width: '100%' }), []);
    const [rowData, setRowData] = useState([
        { row: 'Row 1', name: 'Michael Phelps' },
        { row: 'Row 2', name: 'Natalie Coughlin' },
        { row: 'Row 3', name: 'Aleksey Nemov' },
        { row: 'Row 4', name: 'Alicia Coutts' },
        { row: 'Row 5', name: 'Missy Franklin' },
        { row: 'Row 6', name: 'Ryan Lochte' },
        { row: 'Row 7', name: 'Allison Schmitt' },
        { row: 'Row 8', name: 'Natalie Coughlin' },
        { row: 'Row 9', name: 'Ian Thorpe' },
        { row: 'Row 10', name: 'Bob Mill' },
        { row: 'Row 11', name: 'Willy Walsh' },
        { row: 'Row 12', name: 'Sarah McCoy' },
        { row: 'Row 13', name: 'Jane Jack' },
        { row: 'Row 14', name: 'Tina Wills' },
    ]);
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'row',
        },
        {
            field: 'name',
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        };
    }, []);
    const statusBar = useMemo(() => {
        return {
            statusPanels: [
                {
                    statusPanel: ClickableStatusBarComponent,
                    key: 'statusBarCompKey',
                },
                {
                    statusPanel: 'agAggregationComponent',
                    statusPanelParams: {
                        aggFuncs: ['count', 'sum'],
                    },
                },
            ],
        };
    }, []);

    const toggleStatusBarComp = useCallback(() => {
        getInstance(gridRef.current.api.getStatusPanel('statusBarCompKey'), (statusBarComponent) => {
            statusBarComponent.setVisible(!statusBarComponent.isVisible());
        });
    }, []);

    return (
        <div style={containerStyle}>
            <button onClick={toggleStatusBarComp} style={{ marginBottom: '10px' }}>
                Toggle Status Bar Component
            </button>

            <div
                style={gridStyle}
                className={
                    /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowSelection={rowSelection}
                    statusBar={statusBar}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    ColGroupDef,
    GetDataPath,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
    createGrid,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

const GridExample = () => {
    const gridRef = useRef(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getData());
    const [columnDefs, setColumnDefs] = useState([
        { field: 'created' },
        { field: 'modified' },
        {
            field: 'size',
            aggFunc: 'sum',
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => {
                const sizeInKb = params.value / 1024;

                if (sizeInKb > 1024) {
                    return `${+(sizeInKb / 1024).toFixed(2)} MB`;
                } else {
                    return `${+sizeInKb.toFixed(2)} KB`;
                }
            },
        },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
        };
    }, []);
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: 'File Explorer',
            minWidth: 150,

            cellRendererParams: {
                suppressCount: true,
            },
        };
    }, []);
    const getDataPath = useCallback((data) => data.path, []);

    const onGridReady = useCallback((params) => {
        params.api.setFilterModel({
            size: {
                filterType: 'number',
                type: 'equal',
                filter: 5193728,
            },
        });
    }, []);

    const toggleCheckbox = useCallback(() => {
        const checkbox = document.querySelector('#suppressAggFilteredOnly');
        gridRef.current.api.setGridOption('suppressAggFilteredOnly', checkbox.checked);
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <label>
                        <span>suppressAggFilteredOnly:</span>
                        <input type="checkbox" id="suppressAggFilteredOnly" onClick={toggleCheckbox} defaultChecked />
                    </label>
                </div>

                <div style={gridStyle} className={'ag-theme-quartz'}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        autoGroupColumnDef={autoGroupColumnDef}
                        treeData={true}
                        groupDefaultExpanded={1}
                        suppressAggFilteredOnly={true}
                        getDataPath={getDataPath}
                        onGridReady={onGridReady}
                    />
                </div>
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

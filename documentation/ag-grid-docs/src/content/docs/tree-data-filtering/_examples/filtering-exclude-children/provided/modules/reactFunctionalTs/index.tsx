'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
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
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'created' },
        { field: 'modified' },
        {
            field: 'size',
            aggFunc: 'sum',
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
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
        };
    }, []);
    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            headerName: 'File Explorer',
            minWidth: 150,
            filter: 'agTextColumnFilter',
            cellRendererParams: {
                suppressCount: true,
            },
        };
    }, []);
    const getDataPath = useCallback((data) => data.path, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        params.api.setFilterModel({
            'ag-Grid-AutoColumn': {
                filterType: 'text',
                type: 'startsWith',
                filter: 'ProjectAlpha',
            },
        });
    }, []);

    const toggleFilter = useCallback(() => {
        const checkbox = document.querySelector<HTMLInputElement>('#excludeChildrenWhenTreeDataFiltering')!;
        gridRef.current!.api.setGridOption('excludeChildrenWhenTreeDataFiltering', checkbox.checked);
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div className="example-header">
                    <label>
                        <span>excludeChildrenWhenTreeDataFiltering:</span>
                        <input
                            type="checkbox"
                            id="excludeChildrenWhenTreeDataFiltering"
                            onClick={toggleFilter}
                            defaultChecked
                        />
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
                        groupDefaultExpanded={-1}
                        excludeChildrenWhenTreeDataFiltering={true}
                        getDataPath={getDataPath}
                        onGridReady={onGridReady}
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

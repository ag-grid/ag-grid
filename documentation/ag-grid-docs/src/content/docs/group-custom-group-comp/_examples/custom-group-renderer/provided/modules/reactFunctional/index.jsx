'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import CustomGroupCellRenderer from './customGroupCellRenderer.jsx';
import './styles.css';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, RowGroupingModule]);

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'country',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'year',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'athlete',
        },
        {
            field: 'total',
            aggFunc: 'sum',
        },
    ]);
    const autoGroupColumnDef = useMemo(() => {
        return {
            cellRenderer: CustomGroupCellRenderer,
        };
    }, []);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 120,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    }, []);

    const onCellDoubleClicked = useCallback((params) => {
        if (params.colDef.showRowGroup) {
            params.node.setExpanded(!params.node.expanded);
        }
    }, []);

    const onCellKeyDown = useCallback((params) => {
        if (!('colDef' in params)) {
            return;
        }
        if (!(params.event instanceof KeyboardEvent)) {
            return;
        }
        if (params.event.code !== 'Enter') {
            return;
        }
        if (params.colDef.showRowGroup) {
            params.node.setExpanded(!params.node.expanded);
        }
    }, []);

    return (
        <div style={containerStyle}>
            <div
                style={gridStyle}
                className={
                    /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    autoGroupColumnDef={autoGroupColumnDef}
                    defaultColDef={defaultColDef}
                    groupDefaultExpanded={1}
                    reactiveCustomComponents
                    onGridReady={onGridReady}
                    onCellDoubleClicked={onCellDoubleClicked}
                    onCellKeyDown={onCellKeyDown}
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

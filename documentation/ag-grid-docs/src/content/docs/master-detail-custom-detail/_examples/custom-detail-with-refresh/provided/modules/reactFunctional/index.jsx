'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import DetailCellRenderer from './detailCellRenderer.jsx';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule]);

let allRowData;

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            enableCellChangeFlash: true,
        };
    }, []);
    const detailCellRenderer = useMemo(() => {
        return DetailCellRenderer;
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then((resp) => resp.json())
            .then((data) => {
                allRowData = data;
                setRowData(allRowData);
            });
    }, []);

    const onFirstDataRendered = useCallback(
        (params) => {
            setInterval(() => {
                if (!allRowData) {
                    return;
                }
                const data = allRowData[0];
                const newCallRecords = [];
                data.callRecords.forEach((record, index) => {
                    newCallRecords.push({
                        name: record.name,
                        callId: record.callId,
                        duration: record.duration + (index % 2),
                        switchCode: record.switchCode,
                        direction: record.direction,
                        number: record.number,
                    });
                });
                data.callRecords = newCallRecords;
                data.calls++;
                const tran = {
                    update: [data],
                };
                params.api.applyTransaction(tran);
            }, 2000);
        },
        [allRowData]
    );

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
                    defaultColDef={defaultColDef}
                    masterDetail={true}
                    detailCellRenderer={detailCellRenderer}
                    detailRowHeight={70}
                    groupDefaultExpanded={1}
                    reactiveCustomComponents
                    onGridReady={onGridReady}
                    onFirstDataRendered={onFirstDataRendered}
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

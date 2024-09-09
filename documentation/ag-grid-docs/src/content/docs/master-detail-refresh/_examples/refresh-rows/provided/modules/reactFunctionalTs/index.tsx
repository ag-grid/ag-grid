'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetRowIdParams,
    GridReadyEvent,
    ModuleRegistry,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule]);

let allRowData: any[];

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            enableCellChangeFlash: true,
        };
    }, []);
    const getRowId = useCallback(function (params: GetRowIdParams) {
        return String(params.data.account);
    }, []);
    const detailCellRendererParams = useMemo(() => {
        return {
            refreshStrategy: 'rows',
            detailGridOptions: {
                selection: {
                    mode: 'multiRow',
                    headerCheckbox: false,
                },
                getRowId: (params: GetRowIdParams) => {
                    return String(params.data.callId);
                },
                columnDefs: [
                    { field: 'callId' },
                    { field: 'direction' },
                    { field: 'number', minWidth: 150 },
                    { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                    { field: 'switchCode', minWidth: 150 },
                ],
                defaultColDef: {
                    flex: 1,
                    enableCellChangeFlash: true,
                },
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                // params.successCallback([]);
                params.successCallback(params.data.callRecords);
            },
        };
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then((resp) => resp.json())
            .then((data) => {
                allRowData = data;
                setRowData(data);
            });
    }, []);

    const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            gridRef.current!.api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        }, 0);
        setInterval(function () {
            if (!allRowData) {
                return;
            }
            const data = allRowData[0];
            const newCallRecords: any[] = [];
            data.callRecords.forEach(function (record: any, index: number) {
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
            gridRef.current!.api.applyTransaction(tran);
        }, 2000);
    }, []);

    return (
        <div style={containerStyle}>
            <div
                style={gridStyle}
                className={
                    /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                    'ag-theme-quartz' /** DARK MODE END **/
                }
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    masterDetail={true}
                    detailCellRendererParams={detailCellRendererParams}
                    onGridReady={onGridReady}
                    onFirstDataRendered={onFirstDataRendered}
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

'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, FirstDataRenderedEvent, GetDetailRowDataParams, GetRowIdParams, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule])

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
        }
    }, []);
    const getRowId = useCallback(function (params: GetRowIdParams) {
        return params.data.account;
    }, []);
    const detailCellRendererParams = useMemo(() => {
        return {
            refreshStrategy: 'rows',
            template: (props: any) => (
                <div className="ag-details-row ag-details-row-fixed-height">
                    <div style={{ padding: '4px', fontWeight: 'bold' }}>{props.data.name} {props.data.calls} calls</div>
                    <div ref="eDetailGrid" className="ag-details-grid ag-details-grid-fixed-height" />
                </div >
            ),
            detailGridOptions: {
                rowSelection: 'multiple',
                enableCellChangeFlash: true,
                getRowId: (params: GetRowIdParams) => {
                    return params.data.callId;
                },
                columnDefs: [
                    { field: 'callId', checkboxSelection: true },
                    { field: 'direction' },
                    { field: 'number', minWidth: 150 },
                    { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                    { field: 'switchCode', minWidth: 150 },
                ],
                defaultColDef: {
                    flex: 1,
                    sortable: true,
                },
            },
            getDetailRowData: (params: GetDetailRowDataParams) => {
                // params.successCallback([]);
                params.successCallback(params.data.callRecords);
            },
        }
    }, []);


    const onGridReady = useCallback((params: GridReadyEvent) => {

        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then(resp => resp.json())
            .then(data => {
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
    }, [])


    return (
        <div style={containerStyle}>

            <div style={gridStyle} className="ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    masterDetail={true}
                    enableCellChangeFlash={true}
                    detailCellRendererParams={detailCellRendererParams}
                    onGridReady={onGridReady}
                    onFirstDataRendered={onFirstDataRendered}
                >
                </AgGridReact>
            </div>

        </div>
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))

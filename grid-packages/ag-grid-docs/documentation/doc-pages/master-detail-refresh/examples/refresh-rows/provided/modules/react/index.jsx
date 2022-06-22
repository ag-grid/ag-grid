'use strict';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule])

let allRowData;

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                // group cell renderer needed for expand / collapse icons
                { field: 'name', cellRenderer: 'agGroupCellRenderer' },
                { field: 'account' },
                { field: 'calls' },
                { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
            ],
            defaultColDef: {
                flex: 1,
            },
            getRowId: (params) => {
                return params.data.account;
            },
            detailCellRendererParams: {
                refreshStrategy: 'rows',
                template: (props) => (
                    <div class="ag-details-row ag-details-row-fixed-height">
                        <div style="padding: 4px; font-weight: bold;">{props.data.name} {props.data.calls} calls</div>
                        <div ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height" />
                    </div>
                ),
                detailGridOptions: {
                    rowSelection: 'multiple',
                    enableCellChangeFlash: true,
                    getRowId: (params) => {
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
                getDetailRowData: (params) => {
                    // params.successCallback([]);
                    params.successCallback(params.data.callRecords);
                },
            },
            rowData: null
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            allRowData = data;
            this.setState({ rowData: data });
        };

        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }

    onFirstDataRendered = (params) => {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            params.api.getDisplayedRowAtIndex(0).setExpanded(true);
        }, 0);
        setInterval(function () {
            if (!allRowData) {
                return;
            }
            const data = allRowData[0];
            const newCallRecords = [];
            data.callRecords.forEach(function (record, index) {
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
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div

                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        getRowId={this.state.getRowId}
                        masterDetail={true}
                        enableCellChangeFlash={true}
                        detailCellRendererParams={this.state.detailCellRendererParams}
                        onGridReady={this.onGridReady}
                        onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                        rowData={this.state.rowData}
                    />
                </div>

            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)

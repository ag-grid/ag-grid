
import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { AllModules } from "@ag-grid-enterprise/all-modules";
import { AgGridColumn, AgGridReact } from '@ag-grid-community/react';

import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [allRowData, setAllRowData] = useState([]);
    const [rowData, setRowData] = useState([]);

    const gridApiRef = useRef();

    const onGridReady = params => {
        console.log(params);
        gridApiRef.current = params.api;

        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/master-detail-data.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                const rowData = JSON.parse(httpRequest.responseText);
                setAllRowData(rowData);
                setRowData(rowData);
            }
        };
    };

    useEffect(() => {
        if (!allRowData || allRowData.length == 0) { return; }

        setTimeout(function () {
            gridApiRef.current.getDisplayedRowAtIndex(0).setExpanded(true);
        }, 1000);

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
                    duration: record.duration + index % 2,
                    switchCode: record.switchCode,
                    direction: record.direction,
                    number: record.number
                });
            });
            data.callRecords = newCallRecords;
            data.calls++;
            const tran = { update: [data] };
            gridApiRef.current.applyTransaction(tran);
        }, 2000);

    }, [allRowData]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                id="myGrid"
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className="ag-theme-alpine">
                <AgGridReact
                    modules={AllModules}
                    defaultColDef={{ flex: 1 }}
                    masterDetail={true}
                    enableCellChangeFlash={true}
                    detailCellRendererParams={{
                        refreshStrategy: "nothing",
                        detailGridOptions: {
                            rowSelection: "multiple",
                            enableCellChangeFlash: true,
                            immutableData: true,
                            getRowNodeId: function (data) {
                                return data.callId;
                            },
                            columnDefs: [
                                {
                                    field: "callId",
                                    checkboxSelection: true
                                },
                                { field: "direction" },
                                {
                                    field: "number",
                                    minWidth: 150
                                },
                                {
                                    field: "duration",
                                    valueFormatter: "x.toLocaleString() + 's'"
                                },
                                {
                                    field: "switchCode",
                                    minWidth: 150
                                }
                            ],
                            defaultColDef: {
                                flex: 1,
                                sortable: true
                            }
                        },
                        getDetailRowData: function (params) {
                            params.successCallback(params.data.callRecords);
                        }
                    }}
                    onGridReady={onGridReady}
                    rowData={rowData}>
                    <AgGridColumn field="name" cellRenderer="agGroupCellRenderer" />
                    <AgGridColumn field="account" />
                    <AgGridColumn field="calls" />
                    <AgGridColumn field="minutes" valueFormatter="x.toLocaleString() + 'm'" />
                </AgGridReact>
            </div>

        </div>
    );
};

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
);

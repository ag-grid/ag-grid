
'use strict'

import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const myInput = useRef();

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const updateData = (data) => {
            setRowData(data);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    };

    useEffect(() => {
        if (!myInput.current || !gridApi || !gridColumnApi) { return; }

        myInput.current.addEventListener('keydown', function (event) {
            if (event.key !== 'Tab') { return; }

            event.preventDefault();
            gridApi.ensureIndexVisible(0);

            const firstCol = gridColumnApi.getAllDisplayedColumns()[0];

            gridApi.ensureColumnVisible(firstCol);
            gridApi.setFocusedCell(0, firstCol);
        }, true);

    }, [myInput, gridApi, gridColumnApi]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="test-container">
                <div>
                    <div className="form-container">
                        <label>Tab into Grid (Focus the First Cell)</label>
                        <input ref={myInput} />
                    </div>
                    <div className="form-container">
                        <label>Tab into the Grid (Default Behavior)</label>
                        <input type="text" />
                    </div>
                </div>
                <div id="myGrid" style={{ height: '100%', width: '100%' }} className="ag-theme-alpine">
                    <AgGridReact
                        modules={AllCommunityModules}
                        rowData={rowData}
                        defaultColDef={{
                            editable: true,
                            sortable: true,
                            flex: 1,
                            minWidth: 100,
                            filter: true,
                            resizable: true
                        }}
                        onGridReady={onGridReady}
                    >
                        <AgGridColumn headerName="#" colId="rowNum" valueGetter="node.id" /><AgGridColumn field="athlete" minWidth={170} /><AgGridColumn field="age" /><AgGridColumn field="country" /><AgGridColumn field="year" /><AgGridColumn field="date" /><AgGridColumn field="sport" /><AgGridColumn field="gold" /><AgGridColumn field="silver" /><AgGridColumn field="bronze" /><AgGridColumn field="total" />
                    </AgGridReact>
                </div>
                <div className="form-container">
                    <label>Tab into the grid with Shift-Tab (Default Behavior)</label>
                    <input type="text" />
                </div>
            </div>
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'))

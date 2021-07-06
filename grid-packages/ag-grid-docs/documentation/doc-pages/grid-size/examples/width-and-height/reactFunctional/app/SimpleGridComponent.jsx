'use strict';

import React, { useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

export default () => {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [style, setStyle] = useState({
        height: '100%',
        width: '100%'
    });

    useEffect(() => {
        if (gridApi) {
            gridApi.sizeColumnsToFit();
        }
    }, [rowData]);

    const onGridReady = (params) => {
        setGridApi(params.api);

        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.ag-grid.com/example-assets/olympic-winners.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                var httpResult = JSON.parse(httpRequest.responseText);
                setRowData(httpResult);
            }
        };
    };

    const fillLarge = () => {
        setWidthAndHeight('100%', '100%');
    };

    const fillMedium = () => {
        setWidthAndHeight('60%', '60%');
    };

    const fillExact = () => {
        setWidthAndHeight('400px', '400px');
    };

    const setWidthAndHeight = (width, height) => {
        setStyle({
            width,
            height
        });
    };

    return (
        <div style={{ height: '100%' }}>
            <div style={{ marginBottom: '5px' }}>
                <button onClick={() => fillLarge()}>Fill 100%</button>
                <button onClick={() => fillMedium()}>Fill 60%</button>
                <button onClick={() => fillExact()}>Exactly 400 x 400 pixels</button>
            </div>
            <div style={{ height: 'calc(100% - 25px)' }} className="ag-theme-alpine">
                <div style={style}>
                    <AgGridReact
                        modules={[ClientSideRowModelModule]}
                        rowData={rowData}
                        onGridReady={onGridReady}>
                        <AgGridColumn field="athlete" width={150} />
                        <AgGridColumn field="age" width={90} />
                        <AgGridColumn field="country" width={150} />
                        <AgGridColumn field="year" width={90} />
                        <AgGridColumn field="date" width={150} />
                        <AgGridColumn field="sport" width={150} />
                        <AgGridColumn field="gold" width={100} />
                        <AgGridColumn field="silver" width={100} />
                        <AgGridColumn field="bronze" width={100} />
                        <AgGridColumn field="total" width={100} />
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

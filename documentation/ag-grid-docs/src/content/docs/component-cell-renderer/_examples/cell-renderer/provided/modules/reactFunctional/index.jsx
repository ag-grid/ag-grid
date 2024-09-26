'use strict';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const createImageArr = (imageMultiplier, image) => {
    const arr = [];
    for (let i = 0; i < imageMultiplier; i++) {
        const imgSrc = 'https://www.ag-grid.com/example-assets/weather/' + image;
        arr.push(imgSrc);
    }
    return arr;
};

const DeltaRenderer = (params) => {
    const imgSrc =
        params.value > 15
            ? 'https://www.ag-grid.com/example-assets/weather/fire-plus.png'
            : 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
    return (
        <span>
            <img src={imgSrc} />
            {params.value}
        </span>
    );
};

const IconRenderer = (params) => {
    const value = params.value / (params.divisor ? params.divisor : 1);
    const imgSrcArr = createImageArr(value, params.rendererImage);
    return (
        <span>
            {imgSrcArr.map((image, index) => (
                <img key={index} src={image} />
            ))}
        </span>
    );
};

const GridExample = () => {
    const [rowData, setRowData] = useState();

    const columnDefs = useMemo(
        () => [
            {
                headerName: 'Month',
                field: 'Month',
                width: 75,
            },
            {
                headerName: 'Max Temp',
                field: 'Max temp (C)',
                width: 120,
                cellRenderer: DeltaRenderer,
            },
            {
                headerName: 'Min Temp',
                field: 'Min temp (C)',
                width: 120,
                cellRenderer: DeltaRenderer,
            },
            {
                headerName: 'Frost',
                field: 'Days of air frost (days)',
                width: 233,
                cellRenderer: IconRenderer,
                cellRendererParams: {
                    rendererImage: 'frost.png',
                },
            },
            {
                headerName: 'Sunshine',
                field: 'Sunshine (hours)',
                width: 190,
                cellRenderer: IconRenderer,
                cellRendererParams: {
                    rendererImage: 'sun.png',
                    divisor: 24,
                },
            },
            {
                headerName: 'Rainfall',
                field: 'Rainfall (mm)',
                width: 180,
                cellRenderer: IconRenderer,
                cellRendererParams: {
                    rendererImage: 'rain.png',
                    divisor: 10,
                },
            },
        ],
        []
    );

    const gridRef = useRef(null);

    const onGridReady = () => {
        fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
            .then((resp) => resp.json())
            .then((data) => setRowData(data));
    };

    const randomiseFrost = () => {
        // iterate over the "days of air frost" and make each a random number.
        gridRef.current.api.forEachNode((rowNode) => {
            rowNode.setDataValue('Days of air frost (days)', Math.floor(Math.random() * 4) + 1);
        });
    };

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }),
        []
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '5px' }}>
                    <button onClick={randomiseFrost}>Randomise Frost</button>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    className={
                        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                        'ag-theme-quartz' /** DARK MODE END **/
                    }
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
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

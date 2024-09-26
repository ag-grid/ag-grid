'use strict';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    GridChartsModule,
    MenuModule,
    RowGroupingModule,
]);

const selection = {
    mode: 'cell',
};

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
    const themeName =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz'; /** DARK MODE END **/
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', width: 150, chartDataType: 'category' },
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' },
        { field: 'bronze', chartDataType: 'series' },
        { field: 'total', chartDataType: 'series' },
    ]);
    const defaultColDef = useMemo(() => {
        return { flex: 1 };
    }, []);
    const popupParent = useMemo(() => {
        return document.body;
    }, []);

    const chartPlaceholderRef = useRef(null);
    const [chartRef, setChartRef] = useState();

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
            .then((resp) => resp.json())
            .then((data) => {
                setRowData(data);
            });
        /** PROVIDED EXAMPLE DARK INTEGRATED **/
    }, []);

    const updateChartParams = (chartRef) => {
        setChartRef((prev) => {
            if (prev != chartRef) {
                // destroy the prev chart if it exists
                prev?.destroyChart();
            }
            return chartRef;
        });
    };

    useEffect(() => {
        if (chartRef) {
            // Append the chart element to the placeholder div
            chartPlaceholderRef.current?.appendChild(chartRef.chartElement);
        }
    }, [chartRef]);

    return (
        <div style={containerStyle}>
            <div id="container">
                <div style={gridStyle} className={themeName}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        selection={selection}
                        enableCharts={true}
                        popupParent={popupParent}
                        createChartContainer={updateChartParams}
                        onGridReady={onGridReady}
                    />
                    <div ref={chartPlaceholderRef} className={'chart-wrapper ' + themeName}>
                        {chartRef ? (
                            <div key={chartRef.chartId}>
                                <div className="chart-wrapper-top">
                                    <h2 className="chart-wrapper-title">
                                        Chart created at {new Date().toLocaleString()}
                                    </h2>
                                    <button onClick={() => updateChartParams(undefined)}>Destroy Chart</button>
                                </div>
                            </div>
                        ) : (
                            <div className="chart-placeholder">Chart will be displayed here.</div>
                        )}
                    </div>
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

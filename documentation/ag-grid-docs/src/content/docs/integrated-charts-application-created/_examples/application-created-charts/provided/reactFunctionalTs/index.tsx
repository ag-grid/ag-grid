import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ChartRef,
    ChartType,
    ColDef,
    FirstDataRenderedEvent,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    HighlightChangesModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

declare let __basePath: string;

const modules = [
    ColumnApiModule,
    ClientSideRowModelApiModule,
    TextEditorModule,
    TextFilterModule,
    NumberEditorModule,
    CellStyleModule,
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    RowGroupingModule,
    HighlightChangesModule,
    NumberFilterModule,
];

function numberCellFormatter(params: ValueFormatterParams) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

const GridExample = () => {
    const [columnDefs] = useState<ColDef[]>([
        { field: 'product', chartDataType: 'category', minWidth: 110 },
        { field: 'book', chartDataType: 'category', minWidth: 100 },
        { field: 'current', type: 'measure' },
        { field: 'previous', type: 'measure' },
        { headerName: 'PL 1', field: 'pl1', type: 'measure' },
        { headerName: 'PL 2', field: 'pl2', type: 'measure' },
        { headerName: 'Gain-DX', field: 'gainDx', type: 'measure' },
        { headerName: 'SX / PX', field: 'sxPx', type: 'measure' },
        { field: 'trade', type: 'measure' },
        { field: 'submitterID', type: 'measure' },
        { field: 'submitterDealID', type: 'measure' },
        { field: 'portfolio' },
        { field: 'dealType' },
        { headerName: 'Bid', field: 'bidFlag' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => ({ editable: true, flex: 1, minWidth: 140, filter: true }), []);
    const columnTypes = useMemo(
        () => ({
            measure: {
                chartDataType: 'series' as const,
                cellClass: 'number',
                valueFormatter: numberCellFormatter,
                cellRenderer: 'agAnimateShowChangeCellRenderer',
            },
        }),
        []
    );

    const gridApiRef = useRef<GridApi | null>(null);
    const chartRef = useRef<ChartRef | undefined>(undefined);
    const workerRef = useRef<Worker | null>(null);

    const getRowId = useCallback((params: GetRowIdParams) => String(params.data.trade), []);

    const handleWorkerMessage = useCallback((e: MessageEvent) => {
        const api = gridApiRef.current;
        if (!api) {
            return;
        }
        if (e.data.type === 'setRowData') {
            api.setGridOption('rowData', e.data.records);
        } else if (e.data.type === 'updateData') {
            api.applyTransactionAsync({ update: e.data.records });
        }
    }, []);

    const onGridReady = useCallback(
        (params: GridReadyEvent) => {
            gridApiRef.current = params.api;
            // Create the worker once the grid API exists so the first 'setRowData' message is never dropped.
            if (!workerRef.current) {
                const worker = new Worker(`${__basePath || '.'}/dataUpdateWorker.js`);
                worker.addEventListener('message', handleWorkerMessage);
                worker.postMessage('start');
                workerRef.current = worker;
            }
            /** PROVIDED EXAMPLE DARK INTEGRATED **/
        },
        [handleWorkerMessage]
    );

    const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
        chartRef.current = params.api.createRangeChart({
            chartContainer: document.querySelector('#myChart') as HTMLElement,
            cellRange: {
                columns: ['product', 'current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx'],
            },
            suppressChartRanges: true,
            chartType: 'groupedColumn',
            aggFunc: 'sum',
            chartThemeOverrides: {
                common: {
                    animation: {
                        enabled: false,
                    },
                },
            },
        });
    }, []);

    const updateChart = useCallback((chartType: ChartType) => {
        if (gridApiRef.current && chartRef.current) {
            gridApiRef.current.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.current.chartId, chartType });
        }
    }, []);

    const onStartLoad = useCallback(() => workerRef.current?.postMessage('start'), []);
    const onStopMessages = useCallback(() => workerRef.current?.postMessage('stop'), []);

    // Tear down the worker on unmount so no update interval survives navigation (handles StrictMode double-mount).
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.removeEventListener('message', handleWorkerMessage);
                workerRef.current.terminate();
                workerRef.current = null;
            }
            gridApiRef.current = null;
        };
    }, [handleWorkerMessage]);

    return (
        <AgGridProvider modules={modules}>
            <div id="myApp" className="wrapper">
                <div style={{ paddingBottom: '4px' }}>
                    <span>
                        <button onClick={onStopMessages}>&#9632; Stop</button>
                        <button onClick={onStartLoad}>&#9658; Start</button>
                    </span>
                    <span style={{ marginLeft: '30px' }}>
                        <button onClick={() => updateChart('stackedColumn')}>Stacked Column Chart</button>
                        <button onClick={() => updateChart('groupedColumn')}>Grouped Column Chart</button>
                        <button onClick={() => updateChart('line')}>Line Chart</button>
                    </span>
                </div>
                <div className="my-grid">
                    <AgGridReact
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        columnTypes={columnTypes}
                        enableCharts={true}
                        suppressAggFuncInHeader={true}
                        getRowId={getRowId}
                        getChartToolbarItems={() => []}
                        onGridReady={onGridReady}
                        onFirstDataRendered={onFirstDataRendered}
                    />
                </div>
                <div id="myChart" className="my-chart"></div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

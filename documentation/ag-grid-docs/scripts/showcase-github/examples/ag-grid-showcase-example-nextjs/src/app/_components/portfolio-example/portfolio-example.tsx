'use client';

import { useCallback, useRef, useState } from 'react';

import { type ColDef, type GetRowIdParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ActionsCellRenderer } from '../actions-cell-renderer/actions-cell-renderer';
import { TickerCellRenderer } from '../ticker-cell-renderer/ticker-cell-renderer';
import { UpdateSpeedSlider } from '../update-speed-slider/update-speed-slider';
import {
    calculate52wChange,
    costCalculator,
    currencyFormatter,
    percentageFormatter,
    pnlCalculator,
    pnlPercentCalculator,
    valueCalculator,
} from './calculations';
import { INITIAL_UPDATE_INTERVAL_MULTIPLIER, UPDATE_INTERVAL } from './constants';
import { generatePortfolio } from './data';
import styles from './portfolio-example.module.css';
import { type PortfolioItem } from './types';
import { useDataGenerator } from './useDataGenerator';

const rangeConfig = {
    min: 0,
    max: 4,
    step: 0.1,
};

const PortfolioExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<PortfolioItem[]>(generatePortfolio());
    const [colDefs] = useState<ColDef[]>([
        {
            headerName: 'Symbol',
            field: 'ticker',
            cellDataType: 'text',
            pinned: 'left',
            width: 150,
            cellRenderer: TickerCellRenderer,
        },
        {
            headerName: 'P/L',
            valueGetter: pnlCalculator,
            cellDataType: 'number',
            cellStyle: (params) => {
                if (params.value > 0) {
                    return { color: 'green' };
                } else {
                    return { color: 'red' };
                }
            },
            valueFormatter: currencyFormatter,
            width: 150,
            pivot: true,
            aggFunc: 'sum',
        },
        {
            headerName: 'Last',
            cellDataType: 'number',
            field: 'currentPrice',
            valueFormatter: currencyFormatter,
            width: 100,
            aggFunc: 'avg',
        },

        {
            headerName: 'P/L %',
            valueGetter: pnlPercentCalculator,
            valueFormatter: percentageFormatter,
            width: 100,
            aggFunc: 'avg',
        },
        {
            headerName: 'Change',
            field: 'timeline',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    xKey: 'time',
                    yKey: 'value',
                    fill: 'rgba(185,173,77,0.3)',
                    line: {
                        stroke: 'rgb(185,173,77)',
                    },
                    highlightStyle: {
                        size: 4,
                        stroke: 'rgb(185,173,77)',
                        fill: 'rgb(185,173,77)',
                    },
                    crosshairs: {
                        xLine: {
                            enabled: true,
                            lineDash: 'dash',
                            stroke: '#999',
                        },
                        yLine: {
                            enabled: true,
                            lineDash: 'dash',
                            stroke: '#999',
                        },
                    },
                },
            },
        },
        {
            headerName: 'CCY',
            field: 'ccy',
            cellDataType: 'text',
            enableRowGroup: true,
            width: 80,
        },
        {
            headerName: 'Instrument',
            field: 'instrument',
            cellDataType: 'text',

            rowGroup: true,
            hide: true,
            width: 150,
        },
        {
            headerName: 'Quantity',
            field: 'quantity',
            cellDataType: 'number',
            width: 120,
        },
        {
            headerName: 'Purchase Date',
            field: 'buyDate',
            cellDataType: 'dateString',
            width: 150,
        },
        {
            headerName: 'Cost Price',
            field: 'buyPrice',
            cellDataType: 'number',
            valueFormatter: currencyFormatter,
            width: 120,
            aggFunc: 'avg',
        },
        {
            headerName: 'Total Cost',
            cellDataType: 'number',
            valueGetter: costCalculator,
            valueFormatter: currencyFormatter,
            width: 150,
            aggFunc: 'sum',
        },
        {
            headerName: 'Total Value',
            cellDataType: 'number',
            valueGetter: valueCalculator,
            valueFormatter: currencyFormatter,
            width: 150,
            aggFunc: 'sum',
        },

        {
            headerName: '52w Change %',
            valueGetter: calculate52wChange,
            valueFormatter: percentageFormatter,
            width: 150,
            cellStyle: (params) => {
                if (params.value > 0) {
                    return { color: 'green' };
                } else {
                    return { color: 'red' };
                }
            },
            aggFunc: 'avg',
        },

        { headerName: 'Options', cellRenderer: ActionsCellRenderer, width: 80, pinned: 'right' },
    ]);
    const getRowId = useCallback((params: GetRowIdParams) => {
        return params.data.ticker;
    }, []);
    const generator = useDataGenerator({
        gridRef,
        rowData,
        setRowData,
    });
    const onGridReady = useCallback(() => {
        generator.start();
    }, []);
    const [updateSpeed, setUpdateSpeed] = useState<number>(INITIAL_UPDATE_INTERVAL_MULTIPLIER);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button id="export-to-excel" className="button-secondary">
                        <img className={styles.buttonIcon} src={'/example/finance/icons/download.svg'} />
                        Export to Excel
                    </button>
                    <UpdateSpeedSlider
                        value={updateSpeed}
                        min={rangeConfig.min}
                        max={rangeConfig.max}
                        step={rangeConfig.step}
                        onChange={(value) => {
                            setUpdateSpeed(value);

                            const updateInterval = UPDATE_INTERVAL / value;
                            generator.updateInterval(updateInterval);
                        }}
                    />
                </div>
                <div className={`ag-theme-quartz ${styles.grid}`} style={{ height: 500 }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        getRowId={getRowId}
                        columnDefs={colDefs}
                        defaultColDef={{
                            filter: true,
                            resizable: true,
                        }}
                        enableRangeSelection={true}
                        enableCharts={true}
                        rowSelection="multiple"
                        suppressAggFuncInHeader={true}
                        statusBar={{
                            statusPanels: [
                                { statusPanel: 'agTotalAndFilteredRowCountComponent' },
                                { statusPanel: 'agTotalRowCountComponent' },
                                { statusPanel: 'agFilteredRowCountComponent' },
                                { statusPanel: 'agSelectedRowCountComponent' },
                                { statusPanel: 'agAggregationComponent' },
                            ],
                        }}
                        groupDisplayType="groupRows"
                        groupDefaultExpanded={1}
                        columnMenu="new"
                    />
                </div>
            </div>
        </div>
    );
};

export default PortfolioExample;

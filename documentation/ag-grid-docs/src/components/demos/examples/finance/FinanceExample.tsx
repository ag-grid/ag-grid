import {
    type ColDef,
    type GetRowIdFunc,
    type GetRowIdParams,
    type TooltipRendererParams,
    type TooltipRendererResult,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import classNames from 'classnames';
import { type FunctionComponent, useCallback, useRef, useState } from 'react';

import styles from './FinanceExample.module.css';
import { TickerCellRenderer } from './cell-renderers/ticker-cell-renderer/TickerCellRenderer';
import { generatePortfolio } from './data';
import { toCurrency, toTime } from './formatters';
import { type PortfolioItem } from './types';
import { useDataGenerator } from './useDataGenerator';
import { currencyFormatter, percentageFormatter } from './utils/valueFormatters';
import {
    calculate52wChange,
    costCalculator,
    pnlCalculator,
    pnlPercentCalculator,
    valueCalculator,
} from './utils/valueGetters';

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const FinanceExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const timelineTooltipRenderer = ({ xValue, yValue }: TooltipRendererParams): TooltipRendererResult => {
        return {
            title: toTime({ value: xValue }),
            content: toCurrency({ value: yValue }),
            color: '#94b2d0',
            backgroundColor: '#07161b',
        };
    };

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
            type: 'rightAligned',
            valueGetter: pnlCalculator,
            cellDataType: 'number',
            cellClass: (params) => {
                return classNames({
                    'cell-green': params.value > 0,
                    'cell-red': params.value <= 0,
                });
            },
            valueFormatter: currencyFormatter,
            width: 140,
            pivot: true,
            aggFunc: 'sum',
            suppressHeaderFilterButton: true,
            suppressHeaderMenuButton: true,
        },
        {
            headerName: 'Change',
            field: 'timeline',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    xKey: 'time',
                    yKey: 'value',
                    padding: {
                        top: 2,
                        bottom: 10,
                    },
                    paddingInner: 0.5,
                    paddingOuter: 0.5,
                    fill: '#65819c',
                    line: {
                        stroke: 'rgb(185,173,77)',
                    },
                    highlightStyle: {
                        fill: '#D7E4F2',
                        strokeWidth: 0,
                    },
                    tooltip: {
                        renderer: timelineTooltipRenderer,
                    },
                    axis: {
                        stroke: 'rgba(0,0,0,0.2)', // sets the axis line stroke
                        strokeWidth: 1, // sets the axis line strokeWidth
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
            flex: 1,
            suppressHeaderFilterButton: true,
            sortable: false,
        },
        {
            headerName: 'Last',
            type: 'rightAligned',
            cellDataType: 'number',
            field: 'currentPrice',
            valueFormatter: currencyFormatter,
            width: 120,
            aggFunc: 'avg',
            suppressHeaderFilterButton: true,
        },

        {
            headerName: 'P/L %',
            type: 'rightAligned',
            valueGetter: pnlPercentCalculator,
            valueFormatter: percentageFormatter,
            width: 100,
            aggFunc: 'avg',
            suppressHeaderFilterButton: true,
        },
        {
            headerName: 'Instrument',
            field: 'instrument',
            cellDataType: 'text',
            rowGroup: true,
            hide: true,
            width: 150,
            suppressHeaderFilterButton: true,
        },
        {
            headerName: 'CCY',
            field: 'ccy',
            cellDataType: 'text',
            enableRowGroup: true,
            width: 100,
            filter: 'agSetColumnFilter',
            suppressHeaderMenuButton: true,
        },
        {
            headerName: 'Purchase Date',
            field: 'buyDate',
            cellDataType: 'dateString',
            width: 180,
            filter: 'agDateColumnFilter',
            suppressHeaderMenuButton: true,
        },
        {
            headerName: 'Quantity',
            type: 'rightAligned',
            field: 'quantity',
            cellDataType: 'number',
            width: 120,
            suppressHeaderFilterButton: true,
        },
        {
            headerName: 'Cost Price',
            type: 'rightAligned',
            field: 'buyPrice',
            cellDataType: 'number',
            valueFormatter: currencyFormatter,
            width: 120,
            aggFunc: 'avg',
            suppressHeaderFilterButton: true,
        },
        {
            headerName: 'Total Cost',
            type: 'rightAligned',
            cellDataType: 'number',
            valueGetter: costCalculator,
            valueFormatter: currencyFormatter,
            width: 150,
            aggFunc: 'sum',
            filter: 'agNumberColumnFilter',
        },
        {
            headerName: 'Total Value',
            type: 'rightAligned',
            cellDataType: 'number',
            valueGetter: valueCalculator,
            valueFormatter: currencyFormatter,
            width: 150,
            aggFunc: 'sum',
            suppressHeaderFilterButton: true,
            cellRenderer: 'agAnimateShowChangeCellRenderer',
        },
        {
            headerName: '52w Change %',
            type: 'rightAligned',
            valueGetter: calculate52wChange,
            valueFormatter: percentageFormatter,
            width: 150,
            cellClass: (params) => {
                return classNames({
                    'cell-green': params.value > 0,
                    'cell-red': params.value <= 0,
                });
            },
            aggFunc: 'avg',
            suppressHeaderFilterButton: true,
            suppressHeaderContextMenu: true,
        },
    ]);
    const getRowId = useCallback<GetRowIdFunc>((params: GetRowIdParams) => {
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
    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        onGridReady={onGridReady}
                        getRowId={getRowId}
                        columnDefs={colDefs}
                        defaultColDef={{
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
                        rowGroupPanelShow={'always'}
                    />
                </div>
            </div>
        </div>
    );
};

export default FinanceExample;

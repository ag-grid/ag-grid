import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { type ColDef, type GetRowIdParams, type GridApi, type GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';

import { ActionsCellRenderer } from './actions-cell-renderer.component';
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
import { generatePortfolio, generatePortfolioItemUpdate } from './data';
import { createGenerator } from './data-generator';
import { TickerCellRenderer } from './ticker-cell-renderer.component';
import type { PortfolioItem } from './types';

@Component({
    selector: 'portfolio-example',
    standalone: true,
    imports: [AgGridAngular, TickerCellRenderer, ActionsCellRenderer],
    templateUrl: './portfolio-example.component.html',
    styleUrl: './portfolio-example.component.css',
})
export class PortfolioExample {
    private gridApi!: GridApi;

    rangeConfig = {
        min: 0,
        max: 4,
        step: 0.1,
    };
    updateSpeed: number = INITIAL_UPDATE_INTERVAL_MULTIPLIER;

    themeClass: string = 'ag-theme-quartz';
    rowData: PortfolioItem[] = generatePortfolio();
    generator: ReturnType<typeof createGenerator> = createGenerator({
        interval: UPDATE_INTERVAL / INITIAL_UPDATE_INTERVAL_MULTIPLIER,
        callback: () => {
            const gridApi = this.gridApi;
            if (!gridApi) {
                return;
            }

            const randomIndex = Math.floor(Math.random() * this.rowData.length);
            const portfolioItemToUpdate = this.rowData[randomIndex];
            const newItem = generatePortfolioItemUpdate(portfolioItemToUpdate);
            this.rowData[randomIndex] = newItem;

            gridApi.applyTransactionAsync({
                update: [newItem],
            });
        },
    });
    onSpeedSliderChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.updateSpeed = parseFloat(value);

        const updateInterval = UPDATE_INTERVAL / this.updateSpeed;
        this.generator.updateInterval(updateInterval);
    }

    defaultColDef: ColDef = {
        filter: true,
        resizable: true,
    };
    statusBar = {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' },
        ],
    };
    colDefs: ColDef[] = [
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
    ];

    getRowId(params: GetRowIdParams) {
        return params.data.ticker;
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.generator.start();
    }
}

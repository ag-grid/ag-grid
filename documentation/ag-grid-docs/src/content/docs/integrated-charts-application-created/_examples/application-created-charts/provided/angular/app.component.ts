import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import { AgGridAngular } from 'ag-grid-angular';
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
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { IntegratedChartsModule, RowGroupingModule } from 'ag-grid-enterprise';

import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
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
]);

declare let __basePath: string;

function numberCellFormatter(params: ValueFormatterParams) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div id="myApp" class="wrapper">
        <div style="padding-bottom: 4px">
            <span>
                <button (click)="onStopMessages()">&#9632; Stop</button>
                <button (click)="onStartLoad()">&#9658; Start</button>
            </span>
            <span style="margin-left: 30px">
                <button (click)="updateChart('stackedColumn')">Stacked Column Chart</button>
                <button (click)="updateChart('groupedColumn')">Grouped Column Chart</button>
                <button (click)="updateChart('line')">Line Chart</button>
            </span>
        </div>
        <ag-grid-angular
            class="my-grid"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [columnTypes]="columnTypes"
            [enableCharts]="true"
            [suppressAggFuncInHeader]="true"
            [getRowId]="getRowId"
            [getChartToolbarItems]="getChartToolbarItems"
            (gridReady)="onGridReady($event)"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
        <div id="myChart" class="my-chart"></div>
    </div>`,
})
export class AppComponent implements OnDestroy {
    private gridApi?: GridApi;
    private chartRef?: ChartRef;
    private worker?: Worker;

    columnDefs: ColDef[] = [
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
    ];
    defaultColDef: ColDef = { editable: true, flex: 1, minWidth: 140, filter: true };
    columnTypes: Record<string, ColDef> = {
        measure: {
            chartDataType: 'series',
            cellClass: 'number',
            valueFormatter: numberCellFormatter,
            cellRenderer: 'agAnimateShowChangeCellRenderer',
        },
    };

    getRowId = (params: GetRowIdParams) => String(params.data.trade);
    getChartToolbarItems = () => [];

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        // Create the worker once the grid API exists so the first 'setRowData' message is never dropped.
        if (!this.worker) {
            this.worker = new Worker(`${__basePath || '.'}/dataUpdateWorker.js`);
            this.worker.addEventListener('message', this.handleWorkerMessage);
            this.worker.postMessage('start');
        }
        /** PROVIDED EXAMPLE DARK INTEGRATED **/
    }

    onFirstDataRendered(params: FirstDataRenderedEvent) {
        this.chartRef = params.api.createRangeChart({
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
    }

    updateChart(chartType: ChartType) {
        if (this.gridApi && this.chartRef) {
            this.gridApi.updateChart({ type: 'rangeChartUpdate', chartId: this.chartRef.chartId, chartType });
        }
    }

    onStartLoad() {
        this.worker?.postMessage('start');
    }

    onStopMessages() {
        this.worker?.postMessage('stop');
    }

    // Arrow function so `this` stays bound when used as an event listener.
    private handleWorkerMessage = (e: MessageEvent) => {
        if (!this.gridApi) {
            return;
        }
        if (e.data.type === 'setRowData') {
            this.gridApi.setGridOption('rowData', e.data.records);
        } else if (e.data.type === 'updateData') {
            this.gridApi.applyTransactionAsync({ update: e.data.records });
        }
    };

    // Tear down the worker on destroy so no update interval survives navigation.
    ngOnDestroy() {
        if (this.worker) {
            this.worker.removeEventListener('message', this.handleWorkerMessage);
            this.worker.terminate();
            this.worker = undefined;
        }
        this.gridApi = undefined;
    }
}

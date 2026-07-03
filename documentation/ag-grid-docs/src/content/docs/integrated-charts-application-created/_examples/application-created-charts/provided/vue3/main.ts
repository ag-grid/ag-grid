import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { createApp, defineComponent, onUnmounted, ref } from 'vue';

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
import { AgGridVue } from 'ag-grid-vue3';

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

const VueExample = defineComponent({
    template: `
    <div id="myApp" class="wrapper">
        <div style="padding-bottom: 4px">
            <span>
                <button v-on:click="onStopMessages()">&#9632; Stop</button>
                <button v-on:click="onStartLoad()">&#9658; Start</button>
            </span>
            <span style="margin-left: 30px">
                <button v-on:click="updateChart('stackedColumn')">Stacked Column Chart</button>
                <button v-on:click="updateChart('groupedColumn')">Grouped Column Chart</button>
                <button v-on:click="updateChart('line')">Line Chart</button>
            </span>
        </div>
        <ag-grid-vue
            class="my-grid"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :columnTypes="columnTypes"
            :enableCharts="true"
            :suppressAggFuncInHeader="true"
            :getRowId="getRowId"
            :getChartToolbarItems="getChartToolbarItems"
            @grid-ready="onGridReady"
            @first-data-rendered="onFirstDataRendered"
        ></ag-grid-vue>
        <div id="myChart" class="my-chart"></div>
    </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const columnDefs = ref<ColDef[]>([
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
        const defaultColDef = ref<ColDef>({ editable: true, flex: 1, minWidth: 140, filter: true });
        const columnTypes = ref<Record<string, ColDef>>({
            measure: {
                chartDataType: 'series',
                cellClass: 'number',
                valueFormatter: numberCellFormatter,
                cellRenderer: 'agAnimateShowChangeCellRenderer',
            },
        });

        // Stored as non-reactive closure variables — a Worker inside a Vue reactive proxy makes postMessage throw.
        let gridApi: GridApi | undefined;
        let chartRef: ChartRef | undefined;
        let worker: Worker | undefined;

        const getRowId = (params: GetRowIdParams) => String(params.data.trade);
        const getChartToolbarItems = () => [];

        const handleWorkerMessage = (e: MessageEvent) => {
            if (!gridApi) {
                return;
            }
            if (e.data.type === 'setRowData') {
                gridApi.setGridOption('rowData', e.data.records);
            } else if (e.data.type === 'updateData') {
                gridApi.applyTransactionAsync({ update: e.data.records });
            }
        };

        const onGridReady = (params: GridReadyEvent) => {
            gridApi = params.api;
            // Create the worker once the grid API exists so the first 'setRowData' message is never dropped.
            if (!worker) {
                worker = new Worker(`${__basePath || '.'}/dataUpdateWorker.js`);
                worker.addEventListener('message', handleWorkerMessage);
                worker.postMessage('start');
            }
            /** PROVIDED EXAMPLE DARK INTEGRATED **/
        };

        const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
            chartRef = params.api.createRangeChart({
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
        };

        const updateChart = (chartType: ChartType) => {
            if (gridApi && chartRef) {
                gridApi.updateChart({ type: 'rangeChartUpdate', chartId: chartRef.chartId, chartType });
            }
        };

        const onStartLoad = () => worker?.postMessage('start');
        const onStopMessages = () => worker?.postMessage('stop');

        // Tear down the worker on unmount so no update interval survives navigation.
        onUnmounted(() => {
            if (worker) {
                worker.removeEventListener('message', handleWorkerMessage);
                worker.terminate();
                worker = undefined;
            }
            gridApi = undefined;
        });

        return {
            columnDefs,
            defaultColDef,
            columnTypes,
            getRowId,
            getChartToolbarItems,
            onGridReady,
            onFirstDataRendered,
            updateChart,
            onStartLoad,
            onStopMessages,
        };
    },
});

createApp(VueExample).mount('#app');

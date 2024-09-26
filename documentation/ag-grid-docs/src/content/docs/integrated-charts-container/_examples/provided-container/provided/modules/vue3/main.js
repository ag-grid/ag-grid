import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    GridChartsModule,
    MenuModule,
    RowGroupingModule,
]);

const VueExample = {
    template: `
    <div style="height: 100%">
    <div id="container">
        <ag-grid-vue
            style="width: 100%; height: 300px"
            :class="themeClass"
            :columnDefs="columnDefs"
            :rowData="rowData"
            :defaultColDef="defaultColDef"
            :selection="selection"
            :enableCharts="true"
            :popupParent="popupParent"
            :createChartContainer="createChartContainer"
            @grid-ready="onGridReady"
        ></ag-grid-vue>
        <div id="chartParent" class="chart-wrapper">
            <div :class="'chart-placeholder ' + themeClass">Chart will be displayed here.</div>
        </div>
    </div>
</div>

    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const themeClass =
            /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
            'ag-theme-quartz'; /** DARK MODE END **/
        const columnDefs = ref([
            { field: 'athlete', width: 150, chartDataType: 'category' },
            { field: 'gold', chartDataType: 'series' },
            { field: 'silver', chartDataType: 'series' },
            { field: 'bronze', chartDataType: 'series' },
            { field: 'total', chartDataType: 'series' },
        ]);
        const gridApi = shallowRef();
        const defaultColDef = ref({ flex: 1 });
        const popupParent = ref(null);
        const rowData = ref(null);
        const selection = ref({
            mode: 'cell',
        });

        onBeforeMount(() => {
            popupParent.value = document.body;
        });

        const updateChart = (chartRef) => {
            const eParent = document.querySelector('#chartParent');
            eParent.classList.add(themeClass);
            eParent.innerHTML = ''; // Clear existing content
            const placeHolder = `<div class="chart-placeholder ${themeClass}">Chart will be displayed here.</div>`;
            if (chartRef) {
                const chartWrapperHTML = `
            <div class="chart-wrapper ${themeClass}">
              <div class="chart-wrapper-top">
                <h2 class="chart-wrapper-title">Chart created ${new Date().toLocaleString()}</h2>
                <button class="chart-wrapper-close">Destroy Chart</button>
              </div>
              <div class="chart-wrapper-body"></div>
            </div>
          `;
                eParent.insertAdjacentHTML('beforeend', chartWrapperHTML);
                const eChartWrapper = eParent.lastElementChild;
                eChartWrapper.querySelector('.chart-wrapper-body').appendChild(chartRef.chartElement);
                eChartWrapper.querySelector('.chart-wrapper-close').addEventListener('click', () => {
                    chartRef.destroyChart();
                    eParent.innerHTML = placeHolder;
                });
            } else {
                eParent.innerHTML = placeHolder;
            }
        };

        const onGridReady = (params) => {
            gridApi.value = params.api;
            const updateData = (data) => {
                rowData.value = data;
            };

            fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
            /** PROVIDED EXAMPLE DARK INTEGRATED **/
        };
        // Function for creating the chart container
        const createChartContainer = (chartRef) => {
            updateChart(chartRef);
        };

        return {
            columnDefs,
            gridApi,
            defaultColDef,
            popupParent,
            selection,
            rowData,
            createChartContainer,
            onGridReady,
            themeClass,
        };
    },
};

createApp(VueExample).mount('#app');

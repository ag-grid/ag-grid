import { createApp } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

const DeltaRenderer = {
    template: `<span>
        <img :src="src" />
        {{displayValue}}
        </span>`,
    data: function () {
        return {
            src: '',
            displayValue: '',
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplayValue(params);
        },
        updateDisplay(params) {
            this.displayValue = params.value;
            if (params.value > 15) {
                this.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png';
            } else {
                this.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
            }
        },
    },
};

const IconRenderer = {
    template: `<span>
        <img v-for="images in arr" :src="src" />
        </span>`,
    data: function () {
        return {
            arr: [],
            src: '',
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
        },
        updateDisplay(params) {
            this.src = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
            this.arr = new Array(Math.floor(params.value / (params.divisor || 1)));
        },
    },
};

const VueExample = {
    template: `
        <div style="height: 100%">
        <div class="example-wrapper">
            <div style="margin-bottom: 5px;">
                <button v-on:click="randomiseFrost()">Randomise Frost</button>
            </div>
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :components="components"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    :defaultColDef="defaultColDef"
                    @grid-ready="onGridReady">
            </ag-grid-vue>
        </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        iconRenderer: IconRenderer,
        deltaRenderer: DeltaRenderer,
    },
    data: function () {
        return {
            gridApi: null,
            components: {
                iconRenderer: IconRenderer,
                deltaRenderer: DeltaRenderer,
            },
            columnDefs: this.getColumnDefs(false),
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
            frostPrefix: false,
        };
    },

    methods: {
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => this.gridApi.setGridOption('rowData', data);

            fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        },
        randomiseFrost() {
            // iterate over the "days of air frost" and generate random number
            this.gridApi.forEachNode((rowNode) => {
                rowNode.setDataValue('Days of air frost (days)', Math.floor(pRandom() * 4) + 1);
            });
        },
        getColumnDefs() {
            return [
                {
                    headerName: 'Month',
                    field: 'Month',
                    width: 75,
                },
                {
                    headerName: 'Max Temp',
                    field: 'Max temp (C)',
                    width: 120,
                    cellRenderer: 'deltaRenderer',
                },
                {
                    headerName: 'Min Temp',
                    field: 'Min temp (C)',
                    width: 120,
                    cellRenderer: 'deltaRenderer',
                },
                {
                    headerName: 'Frost',
                    field: 'Days of air frost (days)',
                    width: 233,
                    cellRenderer: 'iconRenderer',
                    cellRendererParams: { rendererImage: 'frost.png' }, // Complementing the Cell Renderer parameters
                },
                {
                    headerName: 'Sunshine',
                    field: 'Sunshine (hours)',
                    width: 190,
                    cellRenderer: 'iconRenderer',
                    cellRendererParams: {
                        rendererImage: 'sun.png',
                        divisor: 24,
                    }, // Complementing the Cell Renderer parameters
                },
                {
                    headerName: 'Rainfall',
                    field: 'Rainfall (mm)',
                    width: 180,
                    cellRenderer: 'iconRenderer',
                    cellRendererParams: {
                        rendererImage: 'rain.png',
                        divisor: 10,
                    }, // Complementing the Cell Renderer parameters
                },
            ];
        },
    },
};

createApp(VueExample).mount('#app');

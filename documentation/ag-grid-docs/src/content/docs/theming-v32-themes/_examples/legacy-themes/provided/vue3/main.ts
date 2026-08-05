import { createApp, defineComponent } from 'vue';

import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const VueExample = defineComponent({
    template: `
        <div class="example-wrapper">
            <div class="example-header">
                <span class="button-group">
                    <button @click="applyTheme('quartz', false)">Quartz</button>
                    <button @click="applyTheme('quartz', true)">Quartz Dark</button>
                    <button @click="applyTheme('alpine', false)">Alpine</button>
                    <button @click="applyTheme('alpine', true)">Alpine Dark</button>
                    <button @click="applyTheme('balham', false)">Balham</button>
                    <button @click="applyTheme('balham', true)">Balham Dark</button>
                    <button @click="applyTheme('material', false)">Material</button>
                    <button @click="applyTheme('material', true)">Material Dark</button>
                </span>
            </div>
            <div id="myGrid" :class="themeClass">
                <ag-grid-vue
                    style="height: 100%"
                    :theme="'legacy'"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    @grid-ready="onGridReady"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            themeClass: 'ag-theme-quartz',
            columnDefs: <ColDef[]>[
                { field: 'athlete' },
                { field: 'country' },
                { field: 'sport' },
                { field: 'year' },
                { field: 'total' },
            ],
            rowData: null as IOlympicData[] | null,
        };
    },
    methods: {
        applyTheme(theme: string, isDark: boolean) {
            this.themeClass = `ag-theme-${theme}${isDark ? '-dark' : ''}`;
        },
        onGridReady(_params: GridReadyEvent<IOlympicData>) {
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data: IOlympicData[]) => (this.rowData = data));
        },
    },
});

createApp(VueExample).mount('#app');

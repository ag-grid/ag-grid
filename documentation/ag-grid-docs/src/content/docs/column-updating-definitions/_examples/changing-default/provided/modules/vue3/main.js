import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <div class="test-container">
        <div class="test-header">
          <button v-on:click="onBtWithDefault()">Set Columns with Initials</button>
          <button v-on:click="onBtRemove()">Remove Columns</button>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            :class="themeClass"
            id="myGrid"
            :columnDefs="columnDefs"
            @grid-ready="onGridReady"
            :defaultColDef="defaultColDef"
            :rowData="rowData"></ag-grid-vue>
      </div>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            columnDefs: [],
            gridApi: null,
            defaultColDef: {
                initialWidth: 100,
            },
            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    beforeMount() {
        this.columnDefs = this.getColumnDefs();
    },
    methods: {
        onBtWithDefault() {
            this.gridApi.setGridOption('columnDefs', this.getColumnDefs());
        },
        onBtRemove() {
            this.gridApi.setGridOption('columnDefs', []);
        },
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        },
        getColumnDefs() {
            return [
                {
                    field: 'athlete',
                    initialWidth: 100,
                    initialSort: 'asc',
                },
                { field: 'age' },
                {
                    field: 'country',
                    initialPinned: 'left',
                },
                { field: 'sport' },
                { field: 'year' },
                { field: 'date' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ];
        },
    },
};

createApp(VueExample).mount('#app');

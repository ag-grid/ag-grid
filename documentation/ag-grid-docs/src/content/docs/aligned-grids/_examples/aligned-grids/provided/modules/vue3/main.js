import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule]);

const VueExample = {
    template: `
        <div style="height: 100%; display: flex; flex-direction: column" :class="themeClass">
            <div style="flex: 0 1 auto;">
                <label><input type="checkbox" checked @change="onCbAthlete($event.target.checked)"/>Athlete</label>
                <label><input type="checkbox" checked @change="onCbAge($event.target.checked)"/>Age</label>
                <label><input type="checkbox" checked @change="onCbCountry($event.target.checked)"/>Country</label>
            </div>
            <ag-grid-vue style="flex: 1 1 auto;"
                         ref="topGrid"
                         :class="themeClass"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         
                         :gridOptions="topOptions"
                         @grid-ready="onGridReady($event)">
            </ag-grid-vue>
            <div style='height: 5%'></div>
            <ag-grid-vue style="flex: 1 1 auto;"
                         ref="bottomGrid"
                         :class="themeClass"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         
                         :gridOptions="bottomOptions">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            columnDefs: [
                { field: 'athlete' },
                { field: 'age' },
                { field: 'country' },
                { field: 'year' },
                { field: 'sport' },
                {
                    headerName: 'Medals',
                    children: [
                        {
                            columnGroupShow: 'closed',
                            colId: 'total',
                            valueGetter: 'data.gold + data.silver + data.bronze',
                            width: 200,
                        },
                        { columnGroupShow: 'open', field: 'gold', width: 100 },
                        { columnGroupShow: 'open', field: 'silver', width: 100 },
                        { columnGroupShow: 'open', field: 'bronze', width: 100 },
                    ],
                },
            ],
            rowData: [],
            topOptions: {
                alignedGrids: () => [this.$refs.bottomGrid],
                defaultColDef: {
                    filter: true,
                    minWidth: 100,
                },
                autoSizeStrategy: {
                    type: 'fitGridWidth',
                },
            },
            bottomOptions: {
                alignedGrids: () => [this.$refs.topGrid],
                defaultColDef: {
                    filter: true,
                    minWidth: 100,
                },
            },
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    mounted() {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((rowData) => (this.rowData = rowData));
    },
    methods: {
        onCbAthlete(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridApi.setColumnsVisible(['athlete'], value);
        },

        onCbAge(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridApi.setColumnsVisible(['age'], value);
        },

        onCbCountry(value) {
            // we only need to update one grid, as the other is a slave
            this.topGridApi.setColumnsVisible(['country'], value);
        },

        onGridReady(params) {
            this.topGridApi = params.api;
        },
    },
};

createApp(VueExample).mount('#app');

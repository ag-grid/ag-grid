import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { createApp } from 'vue';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                :class="themeClass"
                ref="topGrid"
                :gridOptions="topOptions"
                :columnDefs="columnDefs"
                :rowData="rowData">
            </ag-grid-vue>
            <div style='height: 5%'></div>
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                :class="themeClass"
                ref="bottomGrid"
                :gridOptions="bottomOptions"
                :columnDefs="columnDefs"
                :rowData="rowData">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            topOptions: {
                alignedGrids: () => [this.$refs.bottomGrid],
                defaultColDef: {
                    filter: true,
                    flex: 1,
                    minWidth: 120,
                },
                autoSizeStrategy: {
                    type: 'fitGridWidth',
                },
            },
            bottomOptions: {
                alignedGrids: () => [this.$refs.topGrid],
                defaultColDef: {
                    filter: true,
                    flex: 1,
                    minWidth: 120,
                },
            },
            topGridApi: null,
            columnDefs: [
                {
                    headerName: 'Group 1',
                    groupId: 'Group1',
                    children: [
                        { field: 'athlete', pinned: true },
                        { field: 'age', pinned: true, columnGroupShow: 'open' },
                        { field: 'country' },
                        { field: 'year', columnGroupShow: 'open' },
                        { field: 'date' },
                        { field: 'sport', columnGroupShow: 'open' },
                    ],
                },
                {
                    headerName: 'Group 2',
                    groupId: 'Group2',
                    children: [
                        { field: 'athlete', pinned: true },
                        { field: 'age', pinned: true, columnGroupShow: 'open' },
                        { field: 'country' },
                        { field: 'year', columnGroupShow: 'open' },
                        { field: 'date' },
                        { field: 'sport', columnGroupShow: 'open' },
                    ],
                },
            ],

            rowData: null,
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    mounted() {
        this.topGridApi = this.$refs.topGrid.api;

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((rowData) => {
                this.rowData = rowData;

                // mix up some columns
                this.topGridApi.moveColumnByIndex(11, 4);
                this.topGridApi.moveColumnByIndex(11, 4);
            });
    },
};

createApp(VueExample).mount('#app');

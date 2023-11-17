import Vue from 'vue';
import {AgGridVue} from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './styles.css';
import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <div style="display: flex; flex-direction: column; margin-bottom: 1rem;">
                        <div><span style="font-weight: bold;">Athlete Description</span> column width:</div>
                        <div style="padding-left: 1em">- On gridReady event: <span style="font-weight: bold">{{athleteDescriptionColWidthOnReady}}</span></div>
                        <div style="padding-left: 1em">- On firstDataRendered event: <span style="font-weight: bold">{{athleteDescriptionColWidthOnFirstDataRendered}}</span></div>
                    </div>
                    <button v-if="isLoadDataButtonVisible" v-on:click="loadGridData()" style="margin-bottom: 1rem;">Load Grid Data</button>
                </div>
                <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :suppressLoadingOverlay="true"
                    :autoSizeStrategy="autoSizeStrategy"
                    @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            columnDefs: [{
                field: "athleteDescription",
                valueGetter: (params) => {
                    const {data} = params;
                    const {person} = data;
                    return `The ${person.age} years old ${data.name} from ${person.country}`;
                }
            }, {
                field: "medals.gold",
                headerName: "Gold Medals"
            }, {
                field: "person.age",
                headerName: "Age"
            }],
            gridApi: null,
            athleteDescriptionColWidthOnReady: '-',
            athleteDescriptionColWidthOnFirstDataRendered: '-',
            isLoadDataButtonVisible: true,
            defaultColDef: {
                minWidth: 150,
            },
            autoSizeStrategy: {
                type: 'fitCellContents',
                colIds: ['athleteDescription']
            },
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
        }
    },
    created() {
    },
    methods: {
        onFirstDataRendered(params) {
            const {api} = params;
            const column = api.getColumn('athleteDescription');
            if (column) {
                this.athleteDescriptionColWidthOnFirstDataRendered = `${column.getActualWidth()}px`;
            }

            console.log('AG Grid: onFirstDataRendered event triggered');
        },
        loadGridData() {
            this.gridApi.setGridOption('rowData', getData());
            this.isLoadDataButtonVisible = false;
        },
        onGridReady(params) {
            this.gridApi = params.api;

            const column = this.gridApi.getColumn('athleteDescription');
            if (column) {
                this.athleteDescriptionColWidthOnReady = `${column.getActualWidth()}px`;
            }

            console.log('AG Grid: onGridReady event triggered');
        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});

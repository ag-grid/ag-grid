import Vue from "vue";
import {AgGridVue} from "@ag-grid-community/vue";

import {AllCommunityModules} from '@ag-grid-community/all-modules';

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue style="width: 100%; height: 420px;" class="ag-theme-alpine"
                         :gridOptions="topGridOptions"
                         @grid-ready="onGridReady"
                         :columnDefs="columnDefs"
                         :rowData="rowData"
                         :modules="modules"
            ></ag-grid-vue>
            <ag-grid-vue style="width: 100%; height: 40px;" class="ag-theme-alpine"
                         :gridOptions="bottomGridOptions"
                         :headerHeight="0"
                         :columnDefs="columnDefs"
                         :rowData="bottomData"
                         :modules="modules"
                         :rowStyle="rowStyle"
            ></ag-grid-vue>
        </div>
    `,
    components: {
        "ag-grid-vue": AgGridVue
    },
    data: function () {
        return {
            topGridOptions: null,
            bottomGridOptions: null,
            gridApi: null,
            columnApi: null,
            rowData: null,
            bottomData: null,
            columnDefs: null,
            athleteVisible: true,
            ageVisible: true,
            countryVisible: true,
            rowStyle: {fontWeight: 'bold'},
            modules: AllCommunityModules
        };
    },
    beforeMount() {
        this.bottomData = [
            {
                athlete: 'Total',
                age: '15 - 61',
                country: 'Ireland',
                year: '2020',
                date: '26/11/1970',
                sport: 'Synchronised Riding',
                gold: 55,
                silver: 65,
                bronze: 12
            }
        ];

        this.topGridOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            },
            suppressHorizontalScroll: true
        };
        this.bottomGridOptions = {
            alignedGrids: [],
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true,
                filter: true,
                flex: 1,
                minWidth: 100
            }
        }
        this.topGridOptions.alignedGrids.push(this.bottomGridOptions);
        this.bottomGridOptions.alignedGrids.push(this.topGridOptions);

        this.columnDefs = [
            {field: 'athlete', width: 200, hide: !this.athleteVisible},
            {field: 'age', width: 150, hide: !this.ageVisible},
            {field: 'country', width: 150, hide: !this.countryVisible},
            {field: 'year', width: 120},
            {field: 'date', width: 150},
            {field: 'sport', width: 150}
        ];
    },
    mounted() {
        this.gridApi = this.topGridOptions.api;
        this.gridColumnApi = this.topGridOptions.columnApi;
    },
    methods: {
        onGridReady(params) {
            const httpRequest = new XMLHttpRequest();
            const updateData = data => {
                this.rowData = data;
            };

            httpRequest.open(
                "GET",
                "https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json"
            );
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };
        }
    },
};

new Vue({
    el: "#app",
    components: {
        "my-component": VueExample
    }
});

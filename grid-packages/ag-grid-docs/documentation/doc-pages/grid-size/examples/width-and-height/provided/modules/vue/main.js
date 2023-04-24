import Vue from "vue";
import { AgGridVue } from "@ag-grid-community/vue";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="display: flex; flex-direction: column; height: 100%">
            <div style="margin-bottom: 5px;">
                <button @click="fillLarge">Fill 100%</button>
                <button @click="fillMedium">Fill 60%</button>
                <button @click="fillExact">Exactly 400 x 400 pixels</button>
            </div>
            <div style="width: 100%; flex: 1 1 auto;">
                <ag-grid-vue :style="{width, height}" class="ag-theme-alpine"
                             @grid-ready="onGridReady"
                             :columnDefs="columnDefs"
                             :rowData="rowData"
                             ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        "ag-grid-vue": AgGridVue
    },
    data: function () {
        return {
            columnDefs: null,
            rowData: null,
            height: '100%',
            width: '100%'
        };
    },
    beforeMount() {
        this.columnDefs = [
            { field: "athlete", width: 150 },
            { field: "age", width: 90 },
            { field: "country", width: 150 },
            { field: "year", width: 90 },
            { field: "date", width: 150 },
            { field: "sport", width: 150 },
            { field: "gold", width: 100 },
            { field: "silver", width: 100 },
            { field: "bronze", width: 100 },
            { field: "total", width: 100 }
        ];
    },
    mounted() {
    },
    methods: {
        fillLarge() {
            this.setWidthAndHeight('100%', '100%');
        },
        fillMedium() {
            this.setWidthAndHeight('60%', '60%');
        },
        fillExact() {
            this.setWidthAndHeight('400px', '400px');
        },
        setWidthAndHeight(width, height) {
            this.width = width;
            this.height = height;
        },
        onGridReady(params) {
            const httpRequest = new XMLHttpRequest();

            httpRequest.open(
                "GET",
                'https://www.ag-grid.com/example-assets/olympic-winners.json'
            );
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    this.rowData = JSON.parse(httpRequest.responseText);
                }
            };
        }
    }
};

var minRowHeight = 25;

var currentRowHeight = minRowHeight;

new Vue({
    el: "#app",
    components: {
        "my-component": VueExample
    }
});

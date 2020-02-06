import Vue from "vue";
import {AgGridVue} from "@ag-grid-community/vue";

import {AllCommunityModules} from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";

const VueExample = {
    template: `
        <div style="height: 100%">
            <div style="margin-bottom: 5px;">
                <button @click="fillLarge">Fill 100%</button>
                <button @click="fillMedium">Fill 60%</button>
                <button @click="fillExact">Exactly 400 x 400 pixels</button>
            </div>
            <div style="height: calc(100% - 25px);">
                <ag-grid-vue :style="{width, height}" class="ag-theme-balham"
                             @grid-ready="onGridReady"
                             :columnDefs="columnDefs"
                             :rowData="rowData"
                             :modules="modules"></ag-grid-vue>
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
            modules: AllCommunityModules,
            height: '100%',
            width: '100%'
        };
    },
    beforeMount() {
        this.columnDefs = [
            {headerName: "Athlete", field: "athlete", width: 150},
            {headerName: "Age", field: "age", width: 90},
            {headerName: "Country", field: "country", width: 120},
            {headerName: "Year", field: "year", width: 90},
            {headerName: "Date", field: "date", width: 110},
            {headerName: "Sport", field: "sport", width: 110},
            {headerName: "Gold", field: "gold", width: 100},
            {headerName: "Silver", field: "silver", width: 100},
            {headerName: "Bronze", field: "bronze", width: 100},
            {headerName: "Total", field: "total", width: 100}
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
                "https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json"
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

import Vue from 'vue';
import { AgGridVue } from 'ag-grid-vue';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="topOptions"
                @grid-ready="onGridReady"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData">
            </ag-grid-vue>
            <div style='height: 5%'></div>
            <ag-grid-vue
                style="width: 100%; height: 45%;"
                class="ag-theme-alpine"
                id="myGrid"
                :gridOptions="bottomOptions"
                @grid-ready="onGridReady"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function() {
        return {
            topOptions: {
                alignedGrids: [],
                defaultColDef: {
                    editable: true,
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }
            },
            bottomOptions: {
                alignedGrids: [],
                defaultColDef: {
                    editable: true,
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 100
                }
            },
            topGridApi: null,
            bottomGridApi: null,
            topColumnApi: null,
            bottomColumnApi: null,
            columnDefs: null,
            defaultColDef: null,
            rowData: null
        };
    },
    beforeMount() {
        this.columnDefs = [
            {
                headerName: 'Group 1',
                headerClass: 'blue',
                groupId: 'Group1',
                children: [
                    { field: 'athlete', pinned: true, width: 100 },
                    { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                    { field: 'country', width: 100 },
                    { field: 'year', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 }
                ]
            },
            {
                headerName: 'Group 2',
                headerClass: 'green',
                groupId: 'Group2',
                children: [
                    { field: 'athlete', pinned: true, width: 100 },
                    { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                    { field: 'country', width: 100 },
                    { field: 'year', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 }
                ]
            }
        ];
        this.defaultColDef = {
            resizable: true
        };

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    },
    mounted() {
        this.topGridApi = this.topOptions.api;
        this.topColumnApi = this.topOptions.columnApi;
        this.bottomGridApi = this.bottomOptions.api;
        this.bottomColumnApi = this.bottomOptions.columnApi;
    },
    methods: {
        onGridReady(params) {
            const httpRequest = new XMLHttpRequest();
            const updateData = data => {
                this.rowData = data;
            };

            this.topGridApi.sizeColumnsToFit();

            httpRequest.open(
                'GET',
                'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
            );
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                    // mix up some columns
                    this.topColumnApi.moveColumnByIndex(11, 4);
                    this.topColumnApi.moveColumnByIndex(11, 4);
                }
            };
        }
    }
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});

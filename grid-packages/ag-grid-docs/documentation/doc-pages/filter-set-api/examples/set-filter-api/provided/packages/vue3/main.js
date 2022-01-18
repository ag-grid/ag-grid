import {createApp} from 'vue';
import {AgGridVue} from 'ag-grid-vue3';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const countryCellRenderer = function countryCellRenderer(params) {
    return `${params.value.name} (${params.value.code})`;
}

const countryKeyCreator = function countryKeyCreator(params) {
    return params.value.name;
}

const patchData = function patchData(data) {
    data.forEach(function (row) {
        var countryName = row.country;
        var countryCode = countryName.substring(0, 2).toUpperCase();
        row.country = {
            name: countryName,
            code: countryCode
        };
    });
}

const VueExample = {
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div class="example-header">
                    <div>
                        Athlete:
                        <button v-on:click="selectNothing()">API: Filter empty set</button>
                        <button v-on:click="selectJohnAndKenny()">API: Filter only John Joe Nevin and Kenny Egan</button>
                        <button v-on:click="selectEverything()">API: Remove filter</button>
                    </div>
                    <div style="padding-top: 10px;">
                        Country - available filter values
                        <button v-on:click="setCountriesToFranceAustralia()">Filter values restricted to France and Australia</button>
                        <button v-on:click="setCountriesToAll()">Make all countries available</button>
                    </div>
                </div>
                <ag-grid-vue
                        style="width: 100%; height: 100%;"
                        class="ag-theme-alpine"
                        id="myGrid"
                        :columnDefs="columnDefs"
                        @grid-ready="onGridReady"
                        :defaultColDef="defaultColDef"
                        :components="components"
                        :rowData="rowData"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    data: function () {
        return {
            columnDefs: [{
                field: "athlete",
                filter: "agSetColumnFilter",
                filterParams: {"cellHeight": 20}
            }, {
                field: "age",
                maxWidth: 120,
                filter: "agNumberColumnFilter"
            }, {
                field: "country",
                cellRenderer: "countryCellRenderer",
                keyCreator: countryKeyCreator
            }, {
                field: "year",
                maxWidth: 120
            }, {field: "date"}, {field: "sport"}, {
                field: "gold",
                filter: "agNumberColumnFilter"
            }, {
                field: "silver",
                filter: "agNumberColumnFilter"
            }, {
                field: "bronze",
                filter: "agNumberColumnFilter"
            }, {
                field: "total",
                filter: "agNumberColumnFilter"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 160,
                filter: true,
                resizable: true
            },
            components: null,
            rowData: null
        }
    },
    beforeMount() {
        this.components = {countryCellRenderer: countryCellRenderer}
    },
    methods: {
        selectJohnAndKenny() {
            var instance = this.gridApi.getFilterInstance('athlete');
            instance.setModel({
                values: [
                    'John Joe Nevin',
                    'Kenny Egan'
                ]
            });
            this.gridApi.onFilterChanged();
        },
        selectEverything() {
            var instance = this.gridApi.getFilterInstance('athlete');
            instance.setModel(null);
            this.gridApi.onFilterChanged();
        },
        selectNothing() {
            var instance = this.gridApi.getFilterInstance('athlete');
            instance.setModel({values: []});
            this.gridApi.onFilterChanged();
        },
        setCountriesToFranceAustralia() {
            var instance = this.gridApi.getFilterInstance('country');
            instance.setFilterValues([
                'France',
                'Australia'
            ]);
            instance.applyModel();
            this.gridApi.onFilterChanged();
        },
        setCountriesToAll() {
            var instance = this.gridApi.getFilterInstance('country');
            instance.resetFilterValues();
            instance.applyModel();
            this.gridApi.onFilterChanged();
        },
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;


            const updateData = (data) => {
                patchData(data);
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
    }
}

createApp(VueExample)
    .mount("#app")


import {createApp} from 'vue';
import {AgGridVue} from '@ag-grid-community/vue3';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

const COUNTRY_CODES = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    'USA': 'us'
};

const numberParser = function numberParser(params) {
    return parseInt(params.newValue);
}

const countryCellRenderer = function countryCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = '<img border="0" width="15" height="10" src="https://flagcdn.com/h20/' + COUNTRY_CODES[params.value] + '.png">';
        return flag + ' ' + params.value;
    }
}

const stateCellRenderer = function stateCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/gold-star.png">';
        return flag + ' ' + params.value;
    }
}

const cityCellRenderer = function cityCellRenderer(params) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag = '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png">';
        return flag + ' ' + params.value;
    }
}

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                    style="width: 100%; height: 98%;"
                    class="ag-theme-alpine"
                    id="myGrid"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :rowData="rowData"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :columnTypes="columnTypes"
                    :components="components"
                    :groupDefaultExpanded="groupDefaultExpanded"
                    :rowGroupPanelShow="rowGroupPanelShow"
                    :animateRows="true"
                    :modules="modules"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    data: function () {
        return {
            columnDefs: [{
                field: "city",
                type: "dimension",
                cellRenderer: "cityCellRenderer"
            }, {
                field: "country",
                type: "dimension",
                cellRenderer: "countryCellRenderer",
                minWidth: 200
            }, {
                field: "state",
                type: "dimension",
                cellRenderer: "stateCellRenderer",
                rowGroup: true
            }, {
                field: "val1",
                type: "numberValue"
            }, {
                field: "val2",
                type: "numberValue"
            }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 150,
                resizable: true
            },
            rowData: null,
            autoGroupColumnDef: null,
            columnTypes: null,
            components: null,
            groupDefaultExpanded: null,
            rowGroupPanelShow: null,
            modules: [ClientSideRowModelModule, RowGroupingModule]
        }
    },
    beforeMount() {
        this.rowData = [
            {
                country: "Ireland",
                state: null,
                city: "Dublin"
            },
            {
                country: "Ireland",
                state: null,
                city: "Galway"
            },
            {
                country: "Ireland",
                state: null,
                city: "Cork"
            },
            {
                country: "United Kingdom",
                state: null,
                city: "London"
            },
            {
                country: "United Kingdom",
                state: null,
                city: "Manchester"
            },
            {
                country: "United Kingdom",
                state: null,
                city: "Liverpool"
            },
            {
                country: "USA",
                state: "New York",
                city: "New York"
            },
            {
                country: "USA",
                state: "New York",
                city: "Albany"
            },
            {
                country: "USA",
                state: "New York",
                city: "Onondaga"
            },
            {
                country: "USA",
                state: "New York",
                city: "Westchester"
            },
            {
                country: "USA",
                state: "California",
                city: "San Diego"
            },
            {
                country: "USA",
                state: "California",
                city: "San Francisco"
            }
        ];
        this.autoGroupColumnDef = {
            field: "city",
            minWidth: 200
        };
        this.columnTypes = {
            "numberValue": {
                enableValue: true,
                aggFunc: "sum",
                editable: true,
                valueParser: numberParser
            },
            "dimension": {
                enableRowGroup: true,
                enablePivot: true
            }
        };
        this.components = {
            cityCellRenderer: cityCellRenderer,
            countryCellRenderer: countryCellRenderer,
            stateCellRenderer: stateCellRenderer
        };
        this.groupDefaultExpanded = -1;
        this.rowGroupPanelShow = "always"
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;
            this.gridColumnApi = params.columnApi;

        },
    }
}

createApp(VueExample)
    .mount("#app")


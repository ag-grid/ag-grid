import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import '@ag-grid-community/styles/ag-theme-alpine-dark.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <ag-grid-vue
          style="width: 100%; height: 100%;"
          class="ag-theme-alpine-dark"
          id="myGrid"
          :gridOptions="gridOptions"
          @grid-ready="onGridReady"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          :enableRangeSelection="true"
          :rowData="rowData"
          @cell-value-changed="onCellValueChanged"></ag-grid-vue>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            gridOptions: {},
            gridApi: null,
            columnApi: null,
            columnDefs: [
                {
                    headerName: "String (editable)",
                    field: "simple",
                    editable: true,
                },
                {
                    headerName: "Bad Number (editable)",
                    field: "numberBad",
                    editable: true,
                },
                {
                    headerName: "Good Number (editable)",
                    field: "numberGood",
                    editable: true,
                    valueFormatter: `"£" + Math.floor(value).toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, "$1,")`,
                    valueParser: 'Number(newValue)'
                },
                {
                    headerName: "Name (editable)",
                    editable: true,
                    valueGetter: 'data.firstName + " " + data.lastName',
                    valueSetter:
                        // an expression can span multiple lines!!!
                        `var nameSplit = newValue.split(" ");
                         var newFirstName = nameSplit[0];
                         var newLastName = nameSplit[1];
                         if (data.firstName !== newFirstName || data.lastName !== newLastName) {  
                            data.firstName = newFirstName;  
                            data.lastName = newLastName;  
                            return true;
                        } else {  
                            return false;
                        }`
                },
                { headerName: "A", field: 'a', maxWidth: 120 },
                { headerName: "B", field: 'b', maxWidth: 120 },
                { headerName: "A + B", valueGetter: 'data.a + data.b', maxWidth: 120 }
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 200,
                resizable: true,
            },
            rowData: this.createRowData(),
        };
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        onCellValueChanged(event) {
            console.log('data after changes is: ', event.data);
        },
        onGridReady(params) {
            params.api.sizeColumnsToFit();
        },
        createRowData() {
            const rowData = [];
            const words = [
                'One',
                'Apple',
                'Moon',
                'Sugar',
                'Grid',
                'Banana',
                'Sunshine',
                'Stars',
                'Black',
                'White',
                'Salt',
                'Beach',
            ];
            const firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
            const lastNames = [
                'Pink',
                'Black',
                'White',
                'Brown',
                'Smith',
                'Smooth',
                'Anderson',
            ];
            for (let i = 0; i < 100; i++) {
                const randomWords =
                    words[i % words.length] + ' ' + words[(i * 17) % words.length];
                rowData.push({
                    simple: randomWords,
                    numberBad: Math.floor(((i + 2) * 173456) % 10000),
                    numberGood: Math.floor(((i + 2) * 476321) % 10000),
                    a: Math.floor(i % 4),
                    b: Math.floor(i % 7),
                    firstName: firstNames[i % firstNames.length],
                    lastName: lastNames[i % lastNames.length],
                });
            }
            return rowData;
        }
    },
};

createApp(VueExample)
    .mount("#app")


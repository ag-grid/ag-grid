import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import GenderRenderer from './genderRendererVue.js';
import MoodRenderer from './moodRendererVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <ag-grid-vue
          style="width: 100%; height: 100%;"
          class="ag-theme-alpine"
          id="myGrid"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :defaultColDef="defaultColDef"
        ></ag-grid-vue>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        genderCellRenderer: GenderRenderer,
        moodCellRenderer: MoodRenderer
    },
    data: function () {
        return {
            columnDefs: [
                { field: "value" },
                {
                    headerName: "Rendered Value",
                    field: "value",
                    cellRendererSelector: (params) => {
                        const moodDetails = { component: 'moodCellRenderer' };
                        const genderDetails = {
                            component: 'genderCellRenderer',
                            params: {
                                values: [
                                    'Male',
                                    'Female'
                                ]
                            }
                        };
                        if (params.data.type === 'gender')
                            return genderDetails;
                        else if (params.data.type === 'mood')
                            return moodDetails;
                        else
                            return undefined;
                    }
                },
                { field: "type" }
            ],
            defaultColDef: { flex: 1 },
            rowData: [
                {
                    value: 14,
                    type: "age"
                },
                {
                    value: "female",
                    type: "gender"
                },
                {
                    value: "Happy",
                    type: "mood"
                },
                {
                    value: 21,
                    type: "age"
                },
                {
                    value: "male",
                    type: "gender"
                },
                {
                    value: "Sad",
                    type: "mood"
                }
            ]
        }
    }
}

createApp(VueExample)
    .mount("#app")


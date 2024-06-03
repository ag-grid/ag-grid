import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridVue } from '@ag-grid-community/vue3';
import { createApp } from 'vue';

import GenderRenderer from './genderRendererVue.js';
import MoodRenderer from './moodRendererVue.js';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
      <ag-grid-vue
          style="width: 100%; height: 100%;"
          :class="themeClass"
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
        moodCellRenderer: MoodRenderer,
    },
    data: function () {
        return {
            columnDefs: [
                { field: 'value' },
                {
                    headerName: 'Rendered Value',
                    field: 'value',
                    cellRendererSelector: (params) => {
                        const moodDetails = { component: 'moodCellRenderer' };
                        const genderDetails = {
                            component: 'genderCellRenderer',
                            params: {
                                values: ['Male', 'Female'],
                            },
                        };
                        if (params.data.type === 'gender') return genderDetails;
                        else if (params.data.type === 'mood') return moodDetails;
                        else return undefined;
                    },
                },
                { field: 'type' },
            ],
            defaultColDef: {
                flex: 1,
                cellDataType: false,
            },
            rowData: [
                {
                    value: 14,
                    type: 'age',
                },
                {
                    value: 'Female',
                    type: 'gender',
                },
                {
                    value: 'Happy',
                    type: 'mood',
                },
                {
                    value: 21,
                    type: 'age',
                },
                {
                    value: 'Male',
                    type: 'gender',
                },
                {
                    value: 'Sad',
                    type: 'mood',
                },
            ],
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
};

createApp(VueExample).mount('#app');

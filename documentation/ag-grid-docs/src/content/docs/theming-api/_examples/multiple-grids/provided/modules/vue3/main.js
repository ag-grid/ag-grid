import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { applyCustomProperties, themeBalham, themeMaterial, themeQuartz } from '@ag-grid-community/theming';
import { AgGridVue } from '@ag-grid-community/vue3';
import { createApp, onBeforeMount, ref, shallowRef } from 'vue';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <div style="display: flex; gap: 16px">
                <p style="flex: 1 1 0%">Quartz theme:</p>
                <p style="flex: 1 1 0%">Material theme:</p>
            </div>
            <div style="flex: 1 1 0%; display: flex; gap: 16px">
                <div style="flex: 1 1 0%">
                    <ag-grid-vue
                        style="height: 100%;"
                        :columnDefs="columnDefs"
                        :defaultColDef="defaultColDef"
                        :rowData="rowData"
                        :theme="theme1"
                    ></ag-grid-vue>
                </div>
                <div style="flex: 1 1 0%">
                    <ag-grid-vue
                        style="height: 100%;"
                        :columnDefs="columnDefs"
                        :defaultColDef="defaultColDef"
                        :rowData="rowData"
                        :theme="theme2"
                    ></ag-grid-vue>
                </div>
            </div>
            <div style="display: flex; gap: 16px">
                <p style="flex: 1 1 0%">Balham theme (green header):</p>
                <p style="flex: 1 1 0%">Balham theme (red header):</p>
            </div>
            <div style="flex: 1 1 0%; display: flex; gap: 16px">
                <div style="flex: 1 1 0%" ref="grid3">
                    <ag-grid-vue
                        style="height: 100%;"
                        :columnDefs="columnDefs"
                        :defaultColDef="defaultColDef"
                        :rowData="rowData"
                        :theme="theme3"
                    ></ag-grid-vue>
                </div>
                <div style="flex: 1 1 0%" ref="grid4">
                    <ag-grid-vue
                        style="height: 100%;"
                        :columnDefs="columnDefs"
                        :defaultColDef="defaultColDef"
                        :rowData="rowData"
                        :theme="theme3"
                    ></ag-grid-vue>
                </div>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        return {
            theme1: themeQuartz,
            theme2: themeMaterial,
            theme3: themeBalham,

            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            rowData: (() => {
                const rowData = [];
                for (let i = 0; i < 10; i++) {
                    rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
                    rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
                    rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
                }
                return rowData;
            })(),
        };
    },
    mounted() {
        applyCustomProperties({ headerBackgroundColor: '#33cc3344' }, this.$refs.grid3);
        applyCustomProperties({ headerBackgroundColor: '#cc222244' }, this.$refs.grid4);
    },
};

createApp(VueExample).mount('#app');

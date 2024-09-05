import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import {
    colorSchemeDarkBlue,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeLightCold,
    colorSchemeLightNeutral,
    colorSchemeLightWarm,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartzBold,
    iconSetQuartzLight,
    iconSetQuartzRegular,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from '@ag-grid-community/theming';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { computed, createApp, onBeforeMount, ref, shallowRef } from 'vue';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ExcelExportModule,
    MenuModule,
]);

const VueExample = {
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                Theme:
                <select style="margin-right: 16px" v-model="baseTheme">
                    <option v-for="t in baseThemes" :value="t">{{ t.id }}</option>
                </select>
                Icons:
                <select style="margin-right: 16px" v-model="iconSet">
                    <option v-for="iconSet in iconSets" :value="iconSet">{{ iconSet ? iconSet.variant : '(unchanged)' }}</option>
                </select>
                Color scheme:
                <select style="margin-right: 16px" v-model="colorScheme">
                    <option v-for="colorScheme in colorSchemes" :value="colorScheme">{{ colorScheme ? colorScheme.variant : '(unchanged)' }}</option>
                </select>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-vue
                    style="height: 100%;"
                    :theme="theme"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                    :sideBar="true"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const baseTheme = ref(themeQuartz);
        const iconSet = ref(null);
        const colorScheme = ref(null);
        return {
            baseTheme,
            baseThemes: [themeQuartz, themeBalham, themeMaterial],

            iconSet,
            iconSets: [
                null,
                iconSetQuartzLight,
                iconSetQuartzRegular,
                iconSetQuartzBold,
                iconSetAlpine,
                iconSetMaterial,
            ],

            colorSchemes: [
                null,
                colorSchemeLightNeutral,
                colorSchemeLightCold,
                colorSchemeLightWarm,
                colorSchemeDarkNeutral,
                colorSchemeDarkWarm,
                colorSchemeDarkBlue,
            ],
            colorScheme,

            theme: computed(() => {
                let theme = baseTheme.value;
                if (colorScheme.value) {
                    theme = theme.usePart(colorScheme.value);
                }
                if (iconSet.value) {
                    theme = theme.usePart(iconSet.value);
                }
                return theme;
            }),

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
};

createApp(VueExample).mount('#app');

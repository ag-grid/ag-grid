import { createApp } from 'vue';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

// Register shared Modules globally
ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule, MenuModule]);

let rowIdSequence = 100;
const createRowBlock = () =>
    ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));

const VueExample = {
    /* html */
    template: `<div class="example-wrapper">

            <div class="inner-col">
                <div style="height: 100%;" class="inner-col">
                    <ag-grid-vue
                        style="height: 100%;"
                        :class="themeClass"
                        :defaultColDef="defaultColDef"
                        :rowData="leftRowData"
                        :columnDefs="columns"
                        :modules="leftModules"
                        >
                    </ag-grid-vue>
                </div>
            </div>

            <div class="inner-col">
                <div style="height: 100%;" class="inner-col">
                    <ag-grid-vue
                        style="height: 100%;"
                        :class="themeClass"
                        :defaultColDef="defaultColDef"
                        :rowData="rightRowData"
                        :columnDefs="columns"
                        :modules="rightModules"
                        >
                    </ag-grid-vue>
                </div>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            leftRowData: [],
            rightRowData: [],
            leftModules: [SetFilterModule, ClipboardModule],
            rightModules: [ExcelExportModule],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
                floatingFilter: true,
            },
            columns: [{ field: 'id' }, { field: 'color' }, { field: 'value1' }],
            themeClass:
                /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
                'ag-theme-quartz' /** DARK MODE END **/,
        };
    },
    beforeMount() {
        this.leftRowData = createRowBlock();
        this.rightRowData = createRowBlock();
    },
};

createApp(VueExample).mount('#app');

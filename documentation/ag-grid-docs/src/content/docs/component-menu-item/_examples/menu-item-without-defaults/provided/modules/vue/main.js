import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './style.css';
import MenuItem from './menuItemVue.js';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule, RangeSelectionModule, ClipboardModule])

const VueExample = {
    template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 100%;"
                :class="themeClass"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :suppressMenuHide="true"
                :getMainMenuItems="getMainMenuItems">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        MenuItem
    },
    data: function () {
        return {
            columnDefs: [{ field: "athlete" }, { field: "country" }, { field: "sport" }, { field: "year" }, { field: "gold" }, { field: "silver" }, { field: "bronze" }],
            gridApi: null,
            themeClass: /** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/,
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
                menuTabs: ['generalMenuTab'],
            },
            getMainMenuItems: null,
            rowData: null
        }
    },
    created() {
        this.getMainMenuItems = (params) => {
            return [
                ...params.defaultItems,
                'separator',
                {
                    name: 'Filter',
                    menuItem: 'MenuItem',
                    menuItemParams: {
                        column: params.column
                    }
                }
            ];
        }
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => {
                this.rowData = data;
            };

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample
    }
});

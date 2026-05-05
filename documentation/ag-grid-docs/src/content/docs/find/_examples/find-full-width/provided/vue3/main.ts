import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    type FindFullWidthCellRendererParams,
    type GetFindMatchesParams,
    GridReadyEvent,
    type IsFullWidthRowParams,
    ModuleRegistry,
    type RowHeightParams,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData, getLatinText } from './data';
import FullWidthCellRenderer from './fullWidthCellRenderer';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ToolbarModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <span>Go to match:</span>
                <input type="number" v-model="goTo" />
                <button @click="goToFind()">Go To</button>
            </div>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :rowData="rowData"
            :getRowHeight="getRowHeight"
            :isFullWidthRow="isFullWidthRow"
            :fullWidthCellRenderer="fullWidthCellRenderer"
            :fullWidthCellRendererParams="fullWidthCellRendererParams"
            :toolbar="toolbar"></ag-grid-vue>
    </div>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        FullWidthCellRenderer,
    },
    data() {
        return {
            goTo: undefined,
            gridApi: undefined,
            toolbar: {
                items: ['agFindToolbarItem'],
            },
        };
    },
    methods: {
        getRowHeight(params: RowHeightParams) {
            // return 100px height for full width rows
            if (this.isFullWidth(params.data)) {
                return 100;
            }
        },
        isFullWidthRow(params: IsFullWidthRowParams) {
            return this.isFullWidth(params.rowNode.data);
        },
        isFullWidth(data: any) {
            // return true when country is Peru, France or Italy
            return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
        },
        goToFind() {
            const num = Number(this.goTo);
            if (isNaN(num) || num < 0) {
                return;
            }
            this.gridApi.findGoTo(num);
        },
        onGridReady(params: GridReadyEvent) {
            this.gridApi = params.api;
        },
    },
    setup() {
        const columnDefs = ref<ColDef[]>([{ field: 'name' }, { field: 'continent' }, { field: 'language' }]);
        const defaultColDef = ref<ColDef>({
            flex: 1,
        });
        const rowData = ref<any[]>(getData());
        const fullWidthCellRenderer = ref('FullWidthCellRenderer');
        const fullWidthCellRendererParams = ref<FindFullWidthCellRendererParams>({
            getFindMatches: (params: GetFindMatchesParams) => {
                const getMatchesForValue = params.getMatchesForValue;
                // this example only implements searching across part of the renderer
                let numMatches = getMatchesForValue('Sample Text in a Paragraph');
                getLatinText().forEach((paragraph) => {
                    numMatches += getMatchesForValue(paragraph);
                });
                return numMatches;
            },
        });

        return {
            columnDefs,
            defaultColDef,
            rowData,
            fullWidthCellRenderer,
            fullWidthCellRendererParams,
        };
    },
});

createApp(VueExample).mount('#app');

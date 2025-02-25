import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    type FindFullWidthCellRendererParams,
    type GetFindMatchesParams,
    GridReadyEvent,
    type IsFullWidthRowParams,
    ModuleRegistry,
    type RowHeightParams,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData, getLatinText } from './data';
import FullWidthCellRenderer from './fullWidthCellRenderer';
import './styles.css';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <span>Find:</span>
                <input type="text" @input="onInput" @keydown="onKeyDown" />
                <button @click="previous()">Previous</button>
                <button @click="next()">Next</button>
                <span>{{activeMatchNum}}</span>
            </div>
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
            :findSearchValue="findSearchValue"
            @find-changed="onFindChanged"></ag-grid-vue>
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
            activeMatchNum: undefined,
            findSearchValue: undefined,
        };
    },
    methods: {
        onFindChanged(event: FindChangedEvent) {
            const { activeMatch, totalMatches, findSearchValue } = event;
            this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
        },
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
        next() {
            this.gridApi.findNext();
        },
        previous() {
            this.gridApi.findPrevious();
        },
        goToFind() {
            const num = Number(this.goTo);
            if (isNaN(num) || num < 0) {
                return;
            }
            this.gridApi.findGoTo(num);
        },
        onInput(event: Event) {
            this.findSearchValue = (event.target as HTMLInputElement).value;
        },
        onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const backwards = event.shiftKey;
                if (backwards) {
                    this.previous();
                } else {
                    this.next();
                }
            }
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

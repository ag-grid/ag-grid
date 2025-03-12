import { createApp, defineComponent, onBeforeMount, ref, shallowRef } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GetFindTextParams,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import FindRenderer from './findRenderer';
import './styles.css';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

const VueExample = defineComponent({
    template: `
<div style="height: 100%">
    <div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <span>Find:</span>
                <input type="text" value="e" @input="onInput" @keydown="onKeyDown" />
                <button @click="previous()">Previous</button>
                <button @click="next()">Next</button>
                <span>{{activeMatchNum}}</span>
            </div>
        </div>
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :rowData="rowData"
            :findSearchValue="findSearchValue"
            @find-changed="onFindChanged"
            @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
    </div>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        FindRenderer,
    },
    data() {
        return {
            gridApi: undefined,
            activeMatchNum: undefined,
            findSearchValue: 'e',
        };
    },
    methods: {
        onFindChanged(event: FindChangedEvent) {
            const { activeMatch, totalMatches, findSearchValue } = event;
            this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
        },
        next() {
            this.gridApi.findNext();
        },
        previous() {
            this.gridApi.findPrevious();
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

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => {
                    this.rowData = data;
                });
        },
        onFirstDataRendered() {
            this.next();
        },
    },
    setup(props) {
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete' },
            { field: 'country' },
            {
                field: 'year',
                cellRenderer: 'FindRenderer',
                getFindText: (params: GetFindTextParams) => {
                    const cellValue = params.getValueFormatted() ?? params.value?.toString();
                    if (!cellValue?.length) {
                        return null;
                    }
                    return `Year is ${cellValue}`;
                },
            },
        ]);
        const rowData = ref<any[]>(null);

        return {
            columnDefs,
            rowData,
        };
    },
});

createApp(VueExample).mount('#app');

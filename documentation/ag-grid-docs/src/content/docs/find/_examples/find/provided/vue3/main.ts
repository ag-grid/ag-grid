import { createApp, defineComponent, ref } from 'vue';

import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GridReadyEvent,
    ModuleRegistry,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

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
            :rowData="rowData"
            :findSearchValue="findSearchValue"
            @find-changed="onFindChanged"></ag-grid-vue>
    </div>
</div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
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
            console.log('findChanged', event);
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

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => {
                    this.rowData = data;
                });
        },
    },
    setup() {
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete' },
            { field: 'country' },
            { field: 'sport' },
            { field: 'year' },
            { field: 'age', minWidth: 100 },
            { field: 'gold', minWidth: 100 },
            { field: 'silver', minWidth: 100 },
            { field: 'bronze', minWidth: 100 },
        ]);
        const rowData = ref<any[]>(null);

        return {
            columnDefs,
            rowData,
        };
    },
});

createApp(VueExample).mount('#app');

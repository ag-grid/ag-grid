import { createApp, defineComponent } from 'vue';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    RenderApiModule,
    TextEditorModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RenderApiModule,
    TextEditorModule,
    HighlightChangesModule,
    ClientSideRowModelModule,
    NumberEditorModule,
]);

interface LeftData {
    function: string;
    value: string;
}

interface RightData {
    a: number;
    b: number;
}

const rowDataRight: RightData[] = [
    { a: 1, b: 22 },
    { a: 2, b: 33 },
    { a: 3, b: 44 },
    { a: 4, b: 55 },
    { a: 5, b: 66 },
    { a: 6, b: 77 },
    { a: 7, b: 88 },
];

// The Vue wrapper hands the grid its own copy of rowData, so editing the right grid does not
// mutate the array above. Read the sums from the right grid's live nodes via its api instead,
// falling back to the initial data until that grid is ready.
let rightApi: GridApi | undefined;

const VueExample = defineComponent({
    template: /* html */ `
        <div class="example-wrapper">
            <div class="item-header">
                Enter a number to analyse:
                <input type="text" @input="onNewNumber($event.target.value)" />
            </div>
            <div class="item-header">Edit data on RHS, table updates on LHS</div>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="leftColumnDefs"
                :defaultColDef="leftDefaultColDef"
                :enableCellExpressions="true"
                :rowData="rowDataLeft"
                :context="context"
                @grid-ready="onLeftGridReady">
            </ag-grid-vue>
            <ag-grid-vue
                class="grid-wrapper"
                :columnDefs="rightColumnDefs"
                :defaultColDef="rightDefaultColDef"
                :rowData="rowDataRight"
                @grid-ready="onRightGridReady"
                @cell-value-changed="cellValueChanged">
            </ag-grid-vue>
        </div>`,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            leftApi: null as GridApi | null,
            rowDataLeft: <LeftData[]>[
                { function: 'Number Squared', value: '=ctx.theNumber * ctx.theNumber' },
                { function: 'Number x 2', value: '=ctx.theNumber * 2' },
                { function: "Today's Date", value: '=new Date().toLocaleDateString()' },
                { function: 'Sum A', value: '=ctx.sum("a")' },
                { function: 'Sum B', value: '=ctx.sum("b")' },
            ],
            rowDataRight,
            context: <{ theNumber: any; sum: (field: keyof RightData) => number }>{
                theNumber: 4,
                sum: (field: keyof RightData) => {
                    let result = 0;
                    if (rightApi) {
                        rightApi.forEachNode((node) => {
                            if (node.data) {
                                result += node.data[field];
                            }
                        });
                    } else {
                        rowDataRight.forEach((item) => {
                            result += item[field];
                        });
                    }
                    return result;
                },
            },
            leftColumnDefs: <ColDef<LeftData>[]>[
                { headerName: 'Function', field: 'function', minWidth: 150 },
                { headerName: 'Value', field: 'value' },
                {
                    headerName: 'Times 10',
                    valueGetter: 'typeof getValue("value") === "number" ? getValue("value") * 10 : null',
                },
            ],
            leftDefaultColDef: <ColDef>{
                flex: 1,
                sortable: false,
                enableCellChangeFlash: true,
            },
            rightColumnDefs: <ColDef<RightData>[]>[{ field: 'a' }, { field: 'b' }],
            rightDefaultColDef: <ColDef>{
                flex: 1,
                width: 150,
                editable: true,
            },
        };
    },
    methods: {
        onLeftGridReady(params: GridReadyEvent) {
            this.leftApi = params.api;
        },

        onRightGridReady(params: GridReadyEvent) {
            rightApi = params.api;
            // Recompute the sums now the right grid's live data is available.
            this.leftApi?.refreshCells();
        },

        // Tell the left grid to refresh when the number changes.
        onNewNumber(value: string) {
            this.context.theNumber = new Number(value);
            this.leftApi!.refreshCells();
        },

        // Tell the left grid to refresh when the right grid values change.
        cellValueChanged() {
            this.leftApi!.refreshCells();
        },
    },
});

createApp(VueExample).mount('#app');

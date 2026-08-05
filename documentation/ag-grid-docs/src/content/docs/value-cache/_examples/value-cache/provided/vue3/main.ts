import { createApp, defineComponent, ref } from 'vue';

import type { ColDef, GetRowIdParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    ValueCacheModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ValueCacheModule,
    HighlightChangesModule,
    CellStyleModule,
    ClientSideRowModelModule,
    RowGroupingModule,
]);

let callCount = 1;

function formatNumber(params: ValueFormatterParams) {
    return Math.floor(params.value).toLocaleString();
}

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <div class="example-wrapper">
                <div class="example-header">
                    Value Cache:
                    <input type="radio" id="valueCacheOn" name="valueCache" :checked="valueCacheOn" @change="onValueCache(true)"><label for="valueCacheOn">On</label>
                    <input type="radio" id="valueCacheOff" name="valueCache" :checked="!valueCacheOn" @change="onValueCache(false)"><label for="valueCacheOff">Off</label>
                </div>
                <ag-grid-vue
                    v-if="isVisible"
                    style="width: 100%; height: 100%;"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :columnTypes="columnTypes"
                    :rowData="rowData"
                    :valueCache="valueCacheOn"
                    :suppressAggFuncInHeader="true"
                    :groupDefaultExpanded="1"
                    :getRowId="getRowId"
                    @cell-value-changed="onCellValueChanged"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const columnDefs = ref<ColDef[]>([
            { field: 'q1', type: 'quarterFigure' },
            { field: 'q2', type: 'quarterFigure' },
            { field: 'q3', type: 'quarterFigure' },
            { field: 'q4', type: 'quarterFigure' },
            { field: 'year', rowGroup: true, hide: true },
            {
                headerName: 'Total',
                colId: 'total',
                cellClass: ['number-cell', 'total-col'],
                aggFunc: 'sum',
                valueFormatter: formatNumber,
                valueGetter: (params: ValueGetterParams) => {
                    const q1 = params.getValue('q1');
                    const q2 = params.getValue('q2');
                    const q3 = params.getValue('q3');
                    const q4 = params.getValue('q4');
                    const result = q1 + q2 + q3 + q4;
                    console.log(
                        `Total Value Getter (${callCount}, ${params.column.getId()}): ${[q1, q2, q3, q4].join(', ')} =  ${result}`
                    );
                    callCount++;
                    return result;
                },
            },
        ]);
        const defaultColDef = ref<ColDef>({ flex: 1, enableCellChangeFlash: true });
        const autoGroupColumnDef = ref<ColDef>({ minWidth: 140 });
        const columnTypes = ref({
            quarterFigure: {
                cellClass: 'number-cell',
                aggFunc: 'sum',
                valueFormatter: formatNumber,
                valueParser: (params: { newValue: string }) => Number(params.newValue),
            },
        });
        const rowData = ref<any[]>(getData());
        const getRowId = (params: GetRowIdParams) => String(params.data.id);

        const valueCacheOn = ref(false);
        const isVisible = ref(true);

        const onValueCache = (on: boolean) => {
            // valueCache is an initial-only grid option, so toggling it requires a full
            // grid re-creation — remove then re-add the grid to pick up the new setting.
            callCount = 1;
            valueCacheOn.value = on;
            isVisible.value = false;
            setTimeout(() => (isVisible.value = true), 1);
        };

        const onCellValueChanged = () => {
            console.log('onCellValueChanged');
        };

        return {
            columnDefs,
            defaultColDef,
            autoGroupColumnDef,
            columnTypes,
            rowData,
            getRowId,
            valueCacheOn,
            isVisible,
            onValueCache,
            onCellValueChanged,
        };
    },
});

createApp(VueExample).mount('#app');

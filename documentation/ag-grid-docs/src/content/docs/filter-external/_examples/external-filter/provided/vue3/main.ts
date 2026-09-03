import { createApp, defineComponent, ref, shallowRef } from 'vue';

import type { ColDef, GridApi, GridReadyEvent, IDateFilterParams, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ExternalFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import type { IOlympicData } from './interfaces';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ExternalFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    NumberFilterModule,
    DateFilterModule,
]);

const asDate = (dateAsString: string): Date => {
    const splitFields = dateAsString.split('/');
    return new Date(
        Number.parseInt(splitFields[2]),
        Number.parseInt(splitFields[1]) - 1,
        Number.parseInt(splitFields[0])
    );
};

const dateFilterParams: IDateFilterParams = {
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        const cellDate = asDate(cellValue);

        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
        return 0;
    },
};

const VueExample = defineComponent({
    template: `
        <div class="test-container">
            <div class="test-header">
                <label>
                    <input type="radio" name="filter" id="everyone" checked v-on:change="onAgeTypeChanged('everyone')">
                    Everyone
                </label>
                <label>
                    <input type="radio" name="filter" id="below25" v-on:change="onAgeTypeChanged('below25')">
                    Below 25
                </label>
                <label>
                    <input type="radio" name="filter" id="between25and50" v-on:change="onAgeTypeChanged('between25and50')">
                    Between 25 and 50
                </label>
                <label>
                    <input type="radio" name="filter" id="above50" v-on:change="onAgeTypeChanged('above50')">
                    Above 50
                </label>
                <label>
                    <input type="radio" name="filter" id="dateAfter2008" v-on:change="onAgeTypeChanged('dateAfter2008')">
                    After 01/01/2008
                </label>
            </div>
            <ag-grid-vue
                style="width: 100%; height: 100%;"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :rowData="rowData"
                :isExternalFilterPresent="isExternalFilterPresent"
                :doesExternalFilterPass="doesExternalFilterPass"
                @grid-ready="onGridReady"></ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        // A ref, so the callbacks below can be created once in setup() and keep their reference.
        const ageType = ref('everyone');
        const rowData = ref<IOlympicData[] | null>(null);
        const gridApi = shallowRef<GridApi<IOlympicData> | null>(null);

        const columnDefs = ref<ColDef<IOlympicData>[]>([
            { field: 'athlete', minWidth: 180 },
            { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 80 },
            { field: 'country' },
            { field: 'year', maxWidth: 90 },
            {
                field: 'date',
                filter: 'agDateColumnFilter',
                filterParams: dateFilterParams,
            },
            { field: 'total', filter: 'agNumberColumnFilter' },
        ]);

        const defaultColDef = ref<ColDef>({
            flex: 1,
            minWidth: 120,
            filter: true,
        });

        const isExternalFilterPresent = (): boolean => ageType.value !== 'everyone';

        const doesExternalFilterPass = (node: IRowNode<IOlympicData>): boolean => {
            if (node.data) {
                switch (ageType.value) {
                    case 'below25':
                        return node.data.age < 25;
                    case 'between25and50':
                        return node.data.age >= 25 && node.data.age <= 50;
                    case 'above50':
                        return node.data.age > 50;
                    case 'dateAfter2008':
                        return asDate(node.data.date) > new Date(2008, 0, 1);
                    default:
                        return true;
                }
            }
            return true;
        };

        const onGridReady = (params: GridReadyEvent<IOlympicData>) => {
            gridApi.value = params.api;

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((response) => response.json())
                .then((data: IOlympicData[]) => (rowData.value = data));
        };

        const onAgeTypeChanged = (newValue: string) => {
            ageType.value = newValue;
            gridApi.value!.onFilterChanged();
        };

        return {
            columnDefs,
            defaultColDef,
            rowData,
            isExternalFilterPresent,
            doesExternalFilterPass,
            onGridReady,
            onAgeTypeChanged,
        };
    },
});

createApp(VueExample).mount('#app');

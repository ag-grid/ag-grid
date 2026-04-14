import { createApp, defineComponent, ref } from 'vue';

import type { ColDef, SideBarDef, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import OverflowMenu from './overflowMenu';
import './styles.css';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
                <label for="widthSlider">Grid width:</label>
                <input
                    type="range"
                    id="widthSlider"
                    min="35"
                    max="100"
                    :value="widthValue"
                    style="flex: 1"
                    @input="onWidthSliderChange"
                />
                <span>{{ widthValue }}%</span>
            </div>
            <div id="myGrid" :style="{ height: 'calc(100% - 40px)', maxWidth: widthValue + '%' }">
                <ag-grid-vue
                    style="width: 100%; height: 100%"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :enableFilterHandlers="true"
                    :sideBar="sideBar"
                    :toolbar="toolbar"
                    :rowData="rowData"
                />
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const widthValue = ref('100');
        const rowData = ref<any[]>([]);

        const columnDefs: ColDef[] = [
            { field: 'athlete', minWidth: 200 },
            { field: 'country', minWidth: 200 },
            { field: 'sport', minWidth: 200 },
            { field: 'year' },
            { field: 'gold', enableValue: true },
            { field: 'silver', enableValue: true },
            { field: 'bronze', enableValue: true },
            { field: 'total' },
        ];

        const defaultColDef: ColDef = {
            flex: 1,
            minWidth: 100,
            filter: true,
            enableRowGroup: true,
            enablePivot: true,
        };

        const sideBar: SideBarDef = {
            toolPanels: ['columns', 'filters-new'],
            defaultToolPanel: '',
        };

        const toolbar: Toolbar = {
            items: [
                'rowGroupPanel',
                'pivotPanel',
                'separator',
                { toolbarItem: 'columnChooser', display: 'icon' },
                { toolbarItem: 'autoSizeAll', display: 'icon' },
                { toolbarItem: 'quickFilter', alignment: 'right' },
                { toolbarItem: 'find', alignment: 'right' },
                'separator',
                { toolbarItem: 'columnsPanel', alignment: 'right', display: 'icon' },
                { toolbarItem: 'filtersPanel', alignment: 'right', display: 'icon' },
                'separator',
                { toolbarItem: 'csvExport', alignment: 'right', display: 'icon' },
                { toolbarItem: 'excelExport', alignment: 'right', display: 'icon' },
                'separator',
                { toolbarItem: 'resetColumns', alignment: 'right', display: 'icon' },
                { toolbarItem: OverflowMenu, key: 'overflowMenu', alignment: 'right' },
            ],
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data) => (rowData.value = data));

        const onWidthSliderChange = (event: Event) => {
            widthValue.value = (event.target as HTMLInputElement).value;
        };

        return {
            widthValue,
            rowData,
            columnDefs,
            defaultColDef,
            sideBar,
            toolbar,
            onWidthSliderChange,
        };
    },
});

createApp(VueExample).mount('#app');

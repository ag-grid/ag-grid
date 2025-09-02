import { createApp, defineComponent, onMounted, ref, shallowRef, useTemplateRef } from 'vue';

import {
    ClientSideRowModelModule,
    type ColDef,
    type GridApi,
    type GridReadyEvent,
    ModuleRegistry,
    NumberFilterModule,
    type SideBarDef,
    TextFilterModule,
    type ToolPanelDef,
    ValidationModule,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

// Import data interface
import { IOlympicData } from './interfaces';
import './styles.css';

// Register AG Grid modules
ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function addStyles(parentEl: HTMLElement) {
    const contentClassnames = [...parentEl.querySelector('.content')!.classList].filter((e) => e !== 'content');
    parentEl.classList.add(...contentClassnames);
}

const VueExample = defineComponent({
    template: `
        <div style="height: 100%">
            <div id="wrapper" class="example-wrapper">
                <div class="example-header">
                    <button @click="openPopup">Open Columns Panel</button>
                    <button @click="openDrawer">Open Filters Panel</button>
                </div>
                <ag-grid-vue
                    style="width: 100%; height: 100%"
                    @grid-ready="onGridReady"
                    :popupParent="popupParent"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :sideBar="sideBar"
                    :rowData="rowData"
                ></ag-grid-vue>
            </div>

            <!-- Pop-up Panel -->
            <div id="popup" ref="popup">
                <div class="inner">
                    <button @click="closePopup">Close</button>
                    <div class="content" ref="popupContent"></div>
                </div>
            </div>

            <!-- Drawer Panel -->
            <div id="drawer" ref="drawer">
                <div class="inner">
                    <button @click="closeDrawer">Close</button>
                    <div class="content" ref="drawerContent"></div>
                </div>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const drawerRef = useTemplateRef<HTMLElement>('drawer');
        const drawerContentRef = useTemplateRef<HTMLElement>('drawerContent');
        const popupRef = useTemplateRef<HTMLElement>('popup');
        const popupContentRef = useTemplateRef<HTMLElement>('popupContent');
        const gridApi = shallowRef<GridApi<IOlympicData> | null>(null);
        const popupParent = ref<HTMLElement | null>(document.body);
        const columnDefs = ref<ColDef[]>([
            { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
            { field: 'country', minWidth: 180 },
            { field: 'date', minWidth: 150 },
            { field: 'gold', minWidth: 150 },
            { field: 'silver', minWidth: 150 },
        ]);
        const defaultColDef = ref<ColDef>({ flex: 1, minWidth: 100, filter: true });
        const autoGroupColumnDef = ref<ColDef>({ minWidth: 200 });
        const rowData = ref<IOlympicData[] | null>(null);

        const columnsToolPanel = ref<ToolPanelDef>({
            id: 'columns',
            labelDefault: 'Popup',
            labelKey: 'columns',
            iconKey: 'columnsToolPanel',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: { suppressRowGroups: true, suppressValues: true, suppressPivotMode: true },
            parent: popupContentRef.value,
        });
        /*        watchEffect(() => {
            if (input.value) {
                input.value.focus()
            } else {
                // not mounted yet, or the element was unmounted (e.g. by v-if)
            }
        })*/
        const filtersToolPanel = ref<ToolPanelDef>({
            id: 'filters',
            labelDefault: 'Drawer',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        });
        const sideBar = ref<SideBarDef | string | string[] | boolean | null>({
            toolPanels: [columnsToolPanel.value, filtersToolPanel.value],
            hideButtons: true,
            hiddenByDefault: true,
        });

        function closePopup() {
            const drawer = popupRef.value;
            drawer!.classList.toggle('active', false);
            gridApi.value!.closeToolPanel();
        }
        function closeDrawer() {
            const drawer = drawerRef.value;
            drawer!.classList.toggle('active', false);
            gridApi.value!.closeToolPanel();
        }
        function openPopup() {
            closeDrawer();
            const popup = popupRef.value!;
            popup.classList.toggle('active', true);
            gridApi.value!.openToolPanel(columnsToolPanel.value.id);
            addStyles(popup);
        }
        function openDrawer() {
            closePopup();
            const drawer = drawerRef.value!;
            drawer.classList.toggle('active', true);
            gridApi.value!.openToolPanel(filtersToolPanel.value.id, drawer.querySelector<HTMLElement>('.content'));
            addStyles(drawer);
        }
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;

            const updateData = (data: any) => (rowData.value = data);

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((resp) => resp.json())
                .then((data) => updateData(data));
        };
        onMounted(() => {
            // Assign parents only after refs are resolved
            columnsToolPanel.value.parent = popupContentRef.value;
            filtersToolPanel.value.parent = drawerContentRef.value;
        });
        return {
            gridApi,
            popupParent,
            columnDefs,
            defaultColDef,
            autoGroupColumnDef,
            sideBar,
            rowData,
            onGridReady,
            closePopup,
            closeDrawer,
            openPopup,
            openDrawer,
        };
    },
});

const app = createApp(VueExample);
app.mount('#app');
/** TEAR DOWN START **/ (window as any).tearDownExample = () => app.unmount(); /** TEAR DOWN END **/

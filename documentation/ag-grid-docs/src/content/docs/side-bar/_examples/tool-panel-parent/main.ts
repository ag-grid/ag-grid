import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, PivotModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    PivotModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;
const toolPanels = [
    {
        id: 'columns 1',
        labelDefault: 'Inside grid',
        labelKey: 'columns',
        iconKey: 'columnsToolPanel',
        toolPanel: 'agColumnsToolPanel',
    },
    {
        id: 'filters 2',
        labelDefault: 'Outside grid',
        labelKey: 'filters',
        iconKey: 'menu',
        toolPanel: 'agFiltersToolPanel',
        parent: document.getElementById('toolPanelParent'),
    },
    {
        id: 'columns 3',
        labelDefault: 'Popup/Modal/Drawer',
        labelKey: 'columns',
        iconKey: 'columnsToolPanel',
        toolPanel: 'agColumnsToolPanel',
    },
];
const sideBar = {
    toolPanels,
    defaultToolPanel: 'filters',
};
window.toggleMode = function toggleMode() {
    const drawer = document.getElementById('modalDrawer')!;
    const oldClass = drawer.classList.contains('modal')
        ? 'modal'
        : drawer.classList.contains('popup')
          ? 'popup'
          : 'drawer';
    const nextClass = drawer.classList.contains('modal')
        ? 'popup'
        : drawer.classList.contains('popup')
          ? 'drawer'
          : 'modal';
    drawer.classList.replace(oldClass, nextClass);
};
function createModal() {
    if (document.getElementById('modalDrawer')) {
        toggleDrawer();
        return;
    }
    const modalDrawer = document.createElement('div');
    modalDrawer.innerHTML = `
        <div class="inner ag-theme-params-1">
            <div>          
                <p>Modal / Popup / Drawer Content</p>
                <button onclick="toggleMode()">Toggle style</button>
                <button onclick="toggleDrawer()">Close</button>
            </div>
            <div class="content"></div>
        </div>
    `;
    modalDrawer.onclick = (e) => {
        if (e.target === modalDrawer) toggleDrawer();
    };
    modalDrawer.id = 'modalDrawer';
    modalDrawer.classList.add('modal', 'active');
    document.body.prepend(modalDrawer);
}
window.passModal = function passModal() {
    createModal();
    const drawer = document.querySelector('#modalDrawer .content');
    gridApi.updateGridOptions({
        sideBar: {
            ...sideBar,
            toolPanels: Object.values({
                ...toolPanels,
                2: {
                    ...toolPanels[2],
                    parent: drawer,
                },
            }),
        },
    });
    gridApi.openToolPanel(toolPanels[2].id);
};
window.toggleDrawer = function toggleDrawer() {
    const drawer = document.getElementById('modalDrawer')!;
    drawer.classList.toggle('active');
    gridApi.closeToolPanel();
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 180 },
        { field: 'year' },
        { field: 'date', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

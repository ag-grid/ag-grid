
import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';

import 'styles.css';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ServerSideRowModelModule, RowGroupingModule, MenuModule, ColumnsToolPanelModule])

const VueExample = {
    template: `
        <div style="width: 100%; height: 100%;">
            <button v-on:click="resetGrid">Reload Grid</button>
            <div
                class="grid-wrapper"
                v-if="showGrid"
            >
                <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine-dark"
                    :columnDefs="columnDefs"
                    @grid-ready="onGridReady"
                    :defaultColDef="defaultColDef"
                    :autoGroupColumnDef="autoGroupColumnDef"
                    :rowModelType="rowModelType"
                    :pagination="true"
                    :paginationPageSize="paginationPageSize"
                    :serverSideInitialRowCount="serverSideInitialRowCount"
                    :suppressAggFuncInHeader="true"
                    :animateRows="true"
                    @first-data-rendered="onFirstDataRendered"
                    @body-scroll-end="onBodyScrollEnd"
                    @pagination-changed="onPaginationChanged"></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,

    },
    data: function () {
        return {
            columnDefs: [{ field: "index" }, { field: "country" }, { field: "athlete", minWidth: 190 }, { field: "gold" }, { field: "silver" }, { field: "bronze" }],
            gridApi: null,
            columnApi: null,
            defaultColDef: {
                flex: 1,
                minWidth: 90,
                resizable: true,
                sortable: true,
            },
            autoGroupColumnDef: null,
            rowModelType: null,
            paginationPageSize: null,
            serverSideInitialRowCount: null,

            initialPageTarget: null,
            initialRowTarget: null,
            showGrid: true,
            positionInitialised: false,
        }
    },
    created() {
        this.autoGroupColumnDef = {
            flex: 1,
            minWidth: 180,
        };
        this.rowModelType = 'serverSide';
        this.paginationPageSize = 1000;
        this.serverSideInitialRowCount = 5000
        this.initialPageTarget = 4;
        this.initialRowTarget = 4500;
    },
    methods: {
        onFirstDataRendered(event) {
            event.api.paginationGoToPage(this.initialPageTarget);
            event.api.ensureIndexVisible(this.initialRowTarget, 'top');
            this.positionInitialised = true;
        },
        onPaginationChanged(event) {
            if (!this.positionInitialised) {
                return;
            }
            this.initialPageTarget = event.api.paginationGetCurrentPage();
        },
        onBodyScrollEnd(event) {
            if (!this.positionInitialised) {
                return;
            }
            this.initialRowTarget = event.api.getFirstVisibleRowIndex();
            this.serverSideInitialRowCount = event.api.getLastDisplayedRow();
        },
        resetGrid() {
            this.positionInitialised = false;
            this.showGrid = false;
            setTimeout(() => {
              this.showGrid = true;
            }, 10);
        },
        onGridReady(params) {
            const updateData = (data) => data.map((item, index) => ({ ...item, index }));

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => updateData(data))
                .then(data => {
                    // setup the fake server with entire dataset
                    var fakeServer = new FakeServer(data)

                    // create datasource with a reference to the fake server
                    var datasource = getServerSideDatasource(fakeServer)

                    // register the datasource with the grid
                    params.api.setServerSideDatasource(datasource);
                });
        },
    }
}

window.getServerSideDatasource = function getServerSideDatasource(server) {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            var response = server.getData(params.request);
            // adding delay to simulate real server call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                }
                else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}

createApp(VueExample)
    .mount("#app")
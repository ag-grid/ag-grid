import { createApp } from 'vue';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule, exportMultipleSheetsAsExcel } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, ExcelExportModule]);

const SportRenderer = {
    template: `<i class="far fa-trash-alt" style="cursor: pointer" @click="applyTransaction()"></i>`,
    methods: {
        applyTransaction() {
            this.params.api.applyTransaction({ remove: [this.params.node.data] });
        },
    },
};

const VueExample = {
    template: /* html */ `
        <div class="top-container">
            <div>
                <button type="button" class="btn btn-default excel" @click="onExcelExport()">
                    <i class="far fa-file-excel" style="margin-right: 5px; color: green;"></i>Export to Excel
                </button>
                <button type="button" class="btn btn-default reset" @click="reset()">
                    <i class="fas fa-redo" style="margin-right: 5px;"></i>Reset
                </button>
            </div>
            <div class="grid-wrapper">
                <div class="panel panel-primary" style="margin-right: 10px;">
                    <div class="panel-heading">Athletes</div>
                    <div class="panel-body">
                        <ag-grid-vue
                                style="height: 100%;"
                                :defaultColDef="defaultColDef"
                                :rowSelection="rowSelection"
                                :rowDragMultiRow="true"
                                :getRowId="getRowId"
                                :rowDragManaged="true"
                                :suppressMoveWhenRowDragging="true"
                                :rowData="leftRowData"
                                :columnDefs="leftColumns"
                                @grid-ready="onGridReady($event, 0)"
                                >
                        </ag-grid-vue>
                    </div>
                </div>
                <div class="panel panel-primary" style="margin-left: 10px;">
                    <div class="panel-heading">Selected Athletes</div>
                    <div class="panel-body">
                        <ag-grid-vue
                                style="height: 100%;"
                                :defaultColDef="defaultColDef"
                                :getRowId="getRowId"
                                :rowDragManaged="true"
                                :rowData="rightRowData"
                                :columnDefs="rightColumns"
                                @grid-ready="onGridReady($event, 1)"
                                >
                        </ag-grid-vue>
                    </div>
                </div>
            </div>
        </div>`,
    components: {
        'ag-grid-vue': AgGridVue,
        SportRenderer,
    },
    data: function () {
        return {
            leftRowData: null,
            rightRowData: null,
            leftApi: null,
            rightApi: null,

            rowSelection: {
                mode: 'multiRow',
            },
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            leftColumns: [
                {
                    rowDrag: true,
                    maxWidth: 50,
                    suppressHeaderMenuButton: true,
                    suppressHeaderFilterButton: true,
                    rowDragText: (params, dragItemCount) => {
                        if (dragItemCount > 1) {
                            return dragItemCount + ' athletes';
                        }
                        return params.rowNode.data.athlete;
                    },
                },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            rightColumns: [
                {
                    rowDrag: true,
                    maxWidth: 50,
                    suppressHeaderMenuButton: true,
                    suppressHeaderFilterButton: true,
                    rowDragText: (params, dragItemCount) => {
                        if (dragItemCount > 1) {
                            return dragItemCount + ' athletes';
                        }
                        return params.rowNode.data.athlete;
                    },
                },
                { field: 'athlete' },
                { field: 'sport' },
                {
                    suppressHeaderMenuButton: true,
                    suppressHeaderFilterButton: true,
                    maxWidth: 50,
                    cellRenderer: 'SportRenderer',
                },
            ],
        };
    },
    beforeMount() {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                const athletes = [];
                let i = 0;

                while (athletes.length < 20 && i < data.length) {
                    const pos = i++;
                    if (athletes.some((rec) => rec.athlete === data[pos].athlete)) {
                        continue;
                    }
                    athletes.push(data[pos]);
                }
                this.rawData = athletes;
                this.loadGrids();
            });
    },
    methods: {
        getRowId(params) {
            return params.data.athlete;
        },

        loadGrids() {
            this.leftRowData = [...this.rawData.slice(0, this.rawData.length / 2)];
            this.rightRowData = [...this.rawData.slice(this.rawData.length / 2)];
        },

        reset() {
            this.loadGrids();
        },

        onGridReady(params, side) {
            if (side === 0) {
                this.leftApi = params.api;
            }

            if (side === 1) {
                this.rightApi = params.api;
                this.addGridDropZone();
            }
        },

        addGridDropZone() {
            const dropZoneParams = this.rightApi.getRowDropZoneParams({
                onDragStop: (params) => {
                    const nodes = params.nodes;

                    this.leftApi.applyTransaction({
                        remove: nodes.map(function (node) {
                            return node.data;
                        }),
                    });
                },
            });

            this.leftApi.addRowDropZone(dropZoneParams);
        },

        onExcelExport() {
            const spreadsheets = [];

            spreadsheets.push(
                this.leftApi.getSheetDataForExcel({ sheetName: 'Athletes' }),
                this.rightApi.getSheetDataForExcel({ sheetName: 'Selected Athletes' })
            );

            exportMultipleSheetsAsExcel({
                data: spreadsheets,
                fileName: 'ag-grid.xlsx',
            });
        },
    },
};

createApp(VueExample).mount('#app');

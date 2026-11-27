import { createApp, defineComponent } from 'vue';

import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    RowClassRules,
    RowDropZoneParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    RowDragModule,
    RowStyleModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowDragModule,
    ClientSideRowModelApiModule,
    RowApiModule,
    TextFilterModule,
    RowStyleModule,
    ClientSideRowModelModule,
]);

let rowIdSequence = 100;

function createDataItem(color: string) {
    const obj = {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100),
    };

    return obj;
}

const createRowBlock = (blocks: number) =>
    Array.apply(null, Array(blocks || 1))
        .map(() => ['Red', 'Green', 'Blue'].map((color) => createDataItem(color)))
        .reduce((prev, curr) => prev.concat(curr), []);

const VueExample = defineComponent({
    /* html */
    template: `<div class="example-wrapper example-wrapper--row">

            <div class="inner-col example-wrapper">
                <div class="toolbar example-controls">
                    <div class="controls-row">
                        <button class="factory factory-red" data-color="Red" data-side="left" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Red
                        </button>
                        <button class="factory factory-green" data-color="Green" data-side="left" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Green
                        </button>
                        <button class="factory factory-blue" data-color="Blue" data-side="left" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Blue
                        </button>
                    </div>
                </div>
                <div style="height: 100%;" class="inner-col" ref="eLeftGrid">
                    <ag-grid-vue
                        style="height: 100%;"
                        :defaultColDef="defaultColDef"
                        :getRowId="getRowId"
                        :rowClassRules="rowClassRules"
                        :rowDragManaged="true"
                        :suppressMoveWhenRowDragging="true"
                        :rowData="leftRowData"
                        :columnDefs="columns"
                        @grid-ready="onGridReady($event, 'Left')"
                        >
                    </ag-grid-vue>
                </div>
            </div>

            <div class="inner-col vertical-toolbar">
                <span class="bin" ref="eBin">
                    <i class="far fa-trash-alt fa-3x" ref="eBinIcon"></i>
                </span>
            </div>

            <div class="inner-col example-wrapper">
                <div class="toolbar example-controls">
                    <div class="controls-row">
                        <button class="factory factory-red" data-color="Red" data-side="right" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Red
                        </button>
                        <button class="factory factory-green" data-color="Green" data-side="right" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Green
                        </button>
                        <button class="factory factory-blue" data-color="Blue" data-side="right" @click="onFactoryButtonClick($event)">
                            <i class="far fa-plus-square"></i>Add Blue
                        </button>
                    </div>
                </div>
                <div style="height: 100%;" class="inner-col" ref="eRightGrid">
                    <ag-grid-vue
                        style="height: 100%;"
                        :defaultColDef="defaultColDef"
                        :getRowId="getRowId"
                        :rowClassRules="rowClassRules"
                        :rowDragManaged="true"
                        :suppressMoveWhenRowDragging="true"
                        :rowData="rightRowData"
                        :columnDefs="columns"
                        @grid-ready="onGridReady($event, 'Right')"
                        >
                    </ag-grid-vue>
                </div>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            leftRowData: [] as any[],
            rightRowData: [] as any[],
            leftApi: null as GridApi | null,
            rightApi: null as GridApi | null,
            rowClassRules: <RowClassRules>{
                'red-row': 'data.color == "Red"',
                'green-row': 'data.color == "Green"',
                'blue-row': 'data.color == "Blue"',
            },
            defaultColDef: <ColDef>{
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            columns: <ColDef[]>[
                { field: 'id', rowDrag: true },
                { field: 'color' },
                { field: 'value1' },
                { field: 'value2' },
            ],
        };
    },
    beforeMount() {
        this.leftRowData = createRowBlock(2);
        this.rightRowData = createRowBlock(2);
    },
    methods: {
        getRowId(params: GetRowIdParams) {
            return String(params.data.id);
        },

        onGridReady(params: GridReadyEvent, side: 'Left' | 'Right') {
            const api = params.api;
            if (side === 'Left') {
                this.leftApi = api;
            } else {
                this.rightApi = api;
            }

            if (this.leftApi && this.rightApi) {
                this.addBinZone(this.leftApi);
                this.addBinZone(this.rightApi);
                this.addGridDropZone('Left', this.leftApi);
                this.addGridDropZone('Right', this.rightApi);
            }
        },

        addRecordToGrid(side: string, data: any) {
            // if data missing or data has no it, do nothing
            if (!data || data.id == null) {
                return;
            }

            const api = (side === 'left' ? this.leftApi : this.rightApi)!;
            // do nothing if row is already in the grid, otherwise we would have duplicates
            const rowAlreadyInGrid = !!api.getRowNode(data.id);
            let transaction;

            if (rowAlreadyInGrid) {
                console.log('not adding row to avoid duplicates in the grid');
                return;
            }

            transaction = {
                add: [data],
            };

            api.applyTransaction(transaction);
        },

        onFactoryButtonClick(e: MouseEvent) {
            var button = e.currentTarget as HTMLElement,
                buttonColor = button.getAttribute('data-color')!,
                side = button.getAttribute('data-side')!,
                data = createDataItem(buttonColor);

            this.addRecordToGrid(side, data);
        },

        binDrop(data: any) {
            // if data missing or data has no id, do nothing
            if (!data || data.id == null) {
                return;
            }

            var transaction = {
                remove: [data],
            };

            [this.leftApi, this.rightApi].forEach((api) => {
                var rowsInGrid = !!api!.getRowNode(data.id);

                if (rowsInGrid) {
                    api!.applyTransaction(transaction);
                }
            });
        },

        addBinZone(api: GridApi) {
            const eBin = this.$refs.eBin as HTMLElement;
            const eBinIcon = this.$refs.eBinIcon as HTMLElement;
            const dropZone = <RowDropZoneParams>{
                getContainer: () => eBinIcon,
                onDragEnter: () => {
                    eBin.style.color = 'blue';
                    eBinIcon.style.transform = 'scale(1.5)';
                },
                onDragLeave: () => {
                    eBin.style = '';
                    eBinIcon.style.transform = 'scale(1)';
                },
                onDragStop: (params) => {
                    this.binDrop(params.node.data);
                    eBin.style = '';
                    eBinIcon.style.transform = 'scale(1)';
                },
            };

            api.addRowDropZone(dropZone);
        },

        addGridDropZone(side: string, api: GridApi) {
            const dropApi = (side === 'Left' ? this.rightApi : this.leftApi)!;
            const dropZone = dropApi.getRowDropZoneParams();
            if (!dropZone) {
                return;
            }

            api.addRowDropZone(dropZone);
        },
    },
});

createApp(VueExample).mount('#app');

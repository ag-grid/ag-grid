import { createApp, defineComponent } from 'vue';

import type { ColDef, GetRowIdParams, GridApi, GridReadyEvent, RowDropZoneParams } from 'ag-grid-community';
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

interface IColorRow {
    id: number;
    color: string;
    value1: number;
    value2: number;
}

let rowIdSequence = 100;

function createDataItem(color: string): IColorRow {
    const obj = {
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
        value2: Math.floor(Math.random() * 100),
    };

    return obj;
}

function createLeftRowData() {
    return ['Red', 'Green', 'Blue'].map((color) => createDataItem(color));
}

const VueExample = defineComponent({
    /* html */
    template: `<div class="example-wrapper example-wrapper--row">        
            <div class="inner-col">
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

            <div class="inner-col">
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
            leftRowData: [] as IColorRow[],
            rightRowData: [] as IColorRow[],
            leftApi: null as GridApi<IColorRow> | null,
            rightApi: null as GridApi<IColorRow> | null,
            rowClassRules: {
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
        this.leftRowData = createLeftRowData();
    },
    methods: {
        getRowId(params: GetRowIdParams<IColorRow>) {
            return String(params.data.id);
        },

        onGridReady(params: GridReadyEvent<IColorRow>, side: 'Left' | 'Right') {
            const api = params.api;
            if (side === 'Left') {
                this.leftApi = api;
            } else {
                this.rightApi = api;
            }

            this.addBinZone(api);
            this.addGridDropZone(side, api);
        },

        addRecordToGrid(side: string, data: IColorRow | undefined) {
            // if data missing or data has no it, do nothing
            if (!data || data.id == null) {
                return;
            }

            const api = (side === 'left' ? this.leftApi : this.rightApi)!;
            // do nothing if row is already in the grid, otherwise we would have duplicates
            const rowAlreadyInGrid = !!api.getRowNode(String(data.id));
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

        binDrop(data: IColorRow | undefined) {
            // if data missing or data has no id, do nothing
            if (!data || data.id == null) {
                return;
            }

            var transaction = {
                remove: [data],
            };

            [this.leftApi, this.rightApi].forEach((api) => {
                var rowsInGrid = !!api!.getRowNode(String(data.id));

                if (rowsInGrid) {
                    api!.applyTransaction(transaction);
                }
            });
        },

        addBinZone(api: GridApi<IColorRow>) {
            const eBin = this.$refs.eBin as HTMLElement;
            const eBinIcon = this.$refs.eBinIcon as HTMLElement;
            const dropZone = <RowDropZoneParams>{
                getContainer: () => eBinIcon,
                onDragEnter: () => {
                    eBin.style.color = 'blue';
                    eBinIcon.style.transform = 'scale(1.5)';
                },
                onDragLeave: () => {
                    eBin.style.removeProperty('color');
                    eBinIcon.style.transform = 'scale(1)';
                },
                onDragStop: (params) => {
                    this.binDrop(params.node.data);
                    eBin.style.removeProperty('color');
                    eBinIcon.style.transform = 'scale(1)';
                },
            };

            api.addRowDropZone(dropZone);
        },

        addGridDropZone(side: string, api: GridApi<IColorRow>) {
            const dropSide = side === 'Left' ? 'Right' : 'Left';
            const dropZone: RowDropZoneParams = {
                getContainer: () => (dropSide === 'Left' ? this.$refs.eLeftGrid : this.$refs.eRightGrid) as HTMLElement,
                onDragStop: (dragParams) => this.addRecordToGrid(dropSide.toLowerCase(), dragParams.node.data),
            };

            api.addRowDropZone(dropZone);
        },
    },
});

createApp(VueExample).mount('#app');

import { createApp, defineComponent, ref } from 'vue';

import { ClientSideRowModelModule, ModuleRegistry, RowDragModule, ValidationModule } from 'ag-grid-community';
import type { GridOptions, RowDragEndEvent, RowDragMoveEvent } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { getData } from './data';
import FileCellRenderer from './fileCellRenderer';
import { moveFiles } from './fileUtils';
import type { IFile } from './fileUtils';
import './style.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowDragModule,
    TreeDataModule,
    ValidationModule /* Development Only */,
]);

const VueExample = defineComponent({
    template: `
        <ag-grid-vue
            class="myGrid"
            :gridOptions="gridOptions"
            :rowData="rowData">
        </ag-grid-vue>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup() {
        const rowData = ref<IFile[] | null | undefined>(getData());
        const rowDataDragging = ref<IFile[] | null>(null);

        /** Called when row dragging start */
        const onRowDragEnter = () => {
            // Store the original row data to restore it the drag is cancelled
            const rowDataValue = rowData.value;
            rowDataDragging.value = rowDataValue ? [...rowDataValue] : null;
        };

        /** Called both when dragging and dropping (drag end) */
        const onRowDragMove = (event: RowDragMoveEvent<IFile> | RowDragEndEvent<IFile>) => {
            let target = event.overNode?.data;
            const source = event.node.data;
            if (rowData.value && source && source !== target) {
                const reorderOnly = event.event?.shiftKey;
                rowData.value = moveFiles(rowData.value, source, target, reorderOnly);
            }
        };

        /** Called when row dragging end, and the operation need to be committed */
        const onRowDragEnd = (event: RowDragEndEvent<IFile> | RowDragMoveEvent<IFile>) => {
            event.api.clearFocusedCell();
            rowDataDragging.value = null;
            onRowDragMove(event);
        };

        /** Called when row dragging is cancelled, for example, ESC key is pressed */
        const onRowDragCancel = () => {
            if (rowDataDragging.value) {
                // Restore the original row data before the drag started
                rowData.value = rowDataDragging.value;
                rowDataDragging.value = null;
            }
        };

        const gridOptions: GridOptions<IFile> = {
            columnDefs: [
                { field: 'dateModified' },
                {
                    field: 'size',
                    valueFormatter: (params) => (params.value ? params.value + ' MB' : ''),
                },
            ],
            autoGroupColumnDef: {
                rowDrag: true,
                headerName: 'Files',
                minWidth: 300,
                cellRendererParams: {
                    suppressCount: true,
                    innerRenderer: FileCellRenderer,
                },
            },
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.filePath,
            getRowId: (params) => params.data.id,
            onRowDragEnter: onRowDragEnter,
            onRowDragMove: onRowDragMove,
            onRowDragEnd: onRowDragEnd,
            onRowDragCancel: onRowDragCancel,
        };

        return {
            rowData,
            gridOptions,
        };
    },
});

createApp(VueExample).mount('#app');

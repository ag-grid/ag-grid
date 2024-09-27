import type { _DragGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { DragAndDropImageComponent } from './dragAndDropImageComponent';
import { DragAndDropService } from './dragAndDropService';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';

export const DragModule = defineCommunityModule('@ag-grid-community/drag', {
    beans: [DragService],
});

export const DragAndDropModule = defineCommunityModule('@ag-grid-community/drag-and-drop', {
    beans: [DragAndDropService],
    dependsOn: [DragModule],
    userComponents: [
        {
            classImp: DragAndDropImageComponent,
            name: 'agDragAndDropImage',
        },
    ],
});

export const RowDragCoreModule = defineCommunityModule('@ag-grid-community/row-drag-core', {
    beans: [RowDragService],
    dependsOn: [DragAndDropModule],
});

export const RowDragApiModule = defineCommunityModule<_DragGridApi>('@ag-grid-community/row-drag-api', {
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
    dependsOn: [RowDragCoreModule],
});

export const RowDragModule = defineCommunityModule('@ag-grid-community/row-drag', {
    dependsOn: [RowDragApiModule],
});

export const HorizontalResizeModule = defineCommunityModule('@ag-grid-community/horizontal-resize', {
    beans: [HorizontalResizeService],
    dependsOn: [DragModule],
});

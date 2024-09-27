import type { _DragGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { DragAndDropImageComponent } from './dragAndDropImageComponent';
import { DragAndDropService } from './dragAndDropService';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';

export const DragModule = defineCommunityModule('DragModule', {
    beans: [DragService],
});

export const DragAndDropModule = defineCommunityModule('DragAndDropModule', {
    beans: [DragAndDropService],
    dependsOn: [DragModule],
    userComponents: [
        {
            classImp: DragAndDropImageComponent,
            name: 'agDragAndDropImage',
        },
    ],
});

export const RowDragCoreModule = defineCommunityModule('RowDragCoreModule', {
    beans: [RowDragService],
    dependsOn: [DragAndDropModule],
});

export const RowDragApiModule = defineCommunityModule<_DragGridApi>('RowDragApiModule', {
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
    dependsOn: [RowDragCoreModule],
});

export const RowDragModule = defineCommunityModule('RowDragModule', {
    dependsOn: [RowDragApiModule],
});

export const HorizontalResizeModule = defineCommunityModule('HorizontalResizeModule', {
    beans: [HorizontalResizeService],
    dependsOn: [DragModule],
});

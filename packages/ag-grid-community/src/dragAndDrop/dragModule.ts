import type { _DragGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { DragAndDropImageComponent } from './dragAndDropImageComponent';
import { DragAndDropService } from './dragAndDropService';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';

export const DragModule: Module = {
    ...baseCommunityModule('DragModule'),
    beans: [DragService],
};

export const DragAndDropModule: Module = {
    ...baseCommunityModule('DragAndDropModule'),
    beans: [DragAndDropService],
    dependsOn: [DragModule],
    userComponents: [
        {
            classImp: DragAndDropImageComponent,
            name: 'agDragAndDropImage',
        },
    ],
};

export const RowDragCoreModule: Module = {
    ...baseCommunityModule('RowDragCoreModule'),
    beans: [RowDragService],
    dependsOn: [DragAndDropModule],
};

export const RowDragApiModule: ModuleWithApi<_DragGridApi> = {
    ...baseCommunityModule('RowDragApiModule'),
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
    dependsOn: [RowDragCoreModule],
};

export const RowDragModule: Module = {
    ...baseCommunityModule('RowDragModule'),
    dependsOn: [RowDragApiModule],
};

export const HorizontalResizeModule: Module = {
    ...baseCommunityModule('HorizontalResizeModule'),
    beans: [HorizontalResizeService],
    dependsOn: [DragModule],
};

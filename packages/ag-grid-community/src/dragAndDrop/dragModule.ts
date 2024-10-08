import type { _DragGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { DragAndDropImageComponent } from './dragAndDropImageComponent';
import { DragAndDropService } from './dragAndDropService';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';

export const DragModule: _ModuleWithoutApi = {
    ...baseCommunityModule('DragModule'),
    beans: [DragService],
};

export const DragAndDropModule: _ModuleWithoutApi = {
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

export const RowDragCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowDragCoreModule'),
    beans: [RowDragService],
    dependsOn: [DragAndDropModule],
};

export const RowDragApiModule: _ModuleWithApi<_DragGridApi> = {
    ...baseCommunityModule('RowDragApiModule'),
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
    dependsOn: [RowDragCoreModule],
};

export const RowDragModule: _ModuleWithoutApi = {
    ...baseCommunityModule('RowDragModule'),
    dependsOn: [RowDragApiModule],
};

export const HorizontalResizeModule: _ModuleWithoutApi = {
    ...baseCommunityModule('HorizontalResizeModule'),
    beans: [HorizontalResizeService],
    dependsOn: [DragModule],
};

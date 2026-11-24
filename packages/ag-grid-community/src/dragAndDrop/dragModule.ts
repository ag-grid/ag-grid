import type { _DragGridApi } from '../api/gridApi';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { DndSourceComp } from '../rendering/dndSourceComp';
import { VERSION } from '../version';
import { DragAndDropImageComponent } from './dragAndDropImageComponent';
import { DragAndDropService } from './dragAndDropService';
import {
    addRowDropZone,
    getRowDropPositionIndicator,
    getRowDropZoneParams,
    removeRowDropZone,
    setRowDropPositionIndicator,
} from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';
import { RowDropHighlightService } from './rowDropHighlightService';

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const DragModule: _ModuleWithoutApi = {
    moduleName: 'Drag',
    version: VERSION,
    beans: [DragService],
};

/**
 * @feature import & Export -> Drag & Drop
 * @colDef dndSource, dndSourceOnRowDrag
 */
export const DragAndDropModule: _ModuleWithoutApi = {
    moduleName: 'DragAndDrop',
    version: VERSION,
    dynamicBeans: {
        dndSourceComp: DndSourceComp as any,
    },
};

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const SharedDragAndDropModule: _ModuleWithoutApi = {
    moduleName: 'SharedDragAndDrop',
    version: VERSION,
    beans: [DragAndDropService],
    dependsOn: [DragModule],
    userComponents: {
        agDragAndDropImage: DragAndDropImageComponent,
    },
};

/**
 * @feature Rows -> Row Dragging
 * @colDef rowDrag
 * @gridOption isRowDraggable
 */
export const RowDragModule: _ModuleWithApi<_DragGridApi<any>> = {
    moduleName: 'RowDrag',
    version: VERSION,
    beans: [RowDropHighlightService, RowDragService],
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
        getRowDropPositionIndicator,
        setRowDropPositionIndicator,
    },
    dependsOn: [SharedDragAndDropModule],
};

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const HorizontalResizeModule: _ModuleWithoutApi = {
    moduleName: 'HorizontalResize',
    version: VERSION,
    beans: [HorizontalResizeService],
    dependsOn: [DragModule],
};

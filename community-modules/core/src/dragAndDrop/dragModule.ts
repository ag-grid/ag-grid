import type { _DragGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { DragAndDropService } from './dragAndDropService';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';
import { DragService } from './dragService';
import { HorizontalResizeService } from './horizontalResizeService';
import { RowDragService } from './rowDragService';

export const DragModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/drag',
    beans: [DragService],
});

export const DragAndDropModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/drag-and-drop',
    beans: [DragAndDropService],
    dependantModules: [DragModule],
});

export const RowDragModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/row-drag',
    beans: [RowDragService],
    dependantModules: [DragAndDropModule],
});

export const HorizontalResizeModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/horizontal-resize',
    beans: [HorizontalResizeService],
    dependantModules: [DragModule],
});

export const DragApiModule = _defineModule<_DragGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/drag-api',
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
});

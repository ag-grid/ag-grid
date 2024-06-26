import type { DragGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';

export const DragApiModule = _defineModule<DragGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/drag-api',
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
});

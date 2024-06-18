import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { addRowDropZone, getRowDropZoneParams, removeRowDropZone } from './dragApi';

export const DragApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/drag-api',
    apiFunctions: {
        addRowDropZone,
        removeRowDropZone,
        getRowDropZoneParams,
    },
};

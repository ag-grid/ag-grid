import type { Module } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';

export const OverlayApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/overlay-api',
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
};

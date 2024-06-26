import type { OverlayGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';

export const OverlayApiModule = _defineModule<OverlayGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay-api',
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
});

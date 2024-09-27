import type { _OverlayGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';

export const OverlayApiModule = _defineModule<_OverlayGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay-api',
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
});

export const LoadingOverlayModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/loading-overlay',
    userComponents: [
        {
            classImp: LoadingOverlayComponent,
            name: 'agLoadingOverlay',
        },
    ],
});

export const NoRowsOverlayModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/no-rows-overlay',
    userComponents: [
        {
            classImp: NoRowsOverlayComponent,
            name: 'agNoRowsOverlay',
        },
    ],
});

export const OverlayModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay',
    dependantModules: [OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
});

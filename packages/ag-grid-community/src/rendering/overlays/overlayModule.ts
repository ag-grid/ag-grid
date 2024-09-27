import type { _OverlayGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

export const OverlayCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay-core',
    beans: [OverlayService],
});

export const OverlayApiModule = _defineModule<_OverlayGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay-api',
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
    dependantModules: [OverlayCoreModule],
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
    dependantModules: [OverlayCoreModule],
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
    dependantModules: [OverlayCoreModule],
});

export const OverlayModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/overlay',
    dependantModules: [OverlayCoreModule, OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
});

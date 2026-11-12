import type { _OverlayGridApi } from '../../api/gridApi';
import type { _ModuleWithApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { ExportingOverlayComponent } from './exportingOverlayComponent';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoMatchingRowsOverlayComponent } from './noMatchingRowsOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

/**
 * @feature Accessories -> Overlays
 * @gridOption loading, activeOverlay, overlayComponent, overlayComponentSelector
 */
export const OverlayModule: _ModuleWithApi<_OverlayGridApi> = {
    moduleName: 'Overlay',
    version: VERSION,
    userComponents: {
        agLoadingOverlay: LoadingOverlayComponent,
        agNoRowsOverlay: NoRowsOverlayComponent,
        agNoMatchingRowsOverlay: NoMatchingRowsOverlayComponent,
        agExportingOverlay: ExportingOverlayComponent,
    },
    apiFunctions: {
        showNoRowsOverlay,
        hideOverlay,
    },
    beans: [OverlayService],
};

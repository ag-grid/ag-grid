import type { _OverlayGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

export const OverlayCoreModule = defineCommunityModule('@ag-grid-community/overlay-core', {
    beans: [OverlayService],
});

export const OverlayApiModule = defineCommunityModule<_OverlayGridApi>('@ag-grid-community/overlay-api', {
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
    dependsOn: [OverlayCoreModule],
});

export const LoadingOverlayModule = defineCommunityModule('@ag-grid-community/loading-overlay', {
    userComponents: [
        {
            classImp: LoadingOverlayComponent,
            name: 'agLoadingOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
});

export const NoRowsOverlayModule = defineCommunityModule('@ag-grid-community/no-rows-overlay', {
    userComponents: [
        {
            classImp: NoRowsOverlayComponent,
            name: 'agNoRowsOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
});

export const OverlayModule = defineCommunityModule('@ag-grid-community/overlay', {
    dependsOn: [OverlayCoreModule, OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
});

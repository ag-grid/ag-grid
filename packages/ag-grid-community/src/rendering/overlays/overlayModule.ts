import type { _OverlayGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

export const OverlayCoreModule = defineCommunityModule('OverlayCoreModule', {
    beans: [OverlayService],
});

export const OverlayApiModule = defineCommunityModule<_OverlayGridApi>('OverlayApiModule', {
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
    dependsOn: [OverlayCoreModule],
});

export const LoadingOverlayModule = defineCommunityModule('LoadingOverlayModule', {
    userComponents: [
        {
            classImp: LoadingOverlayComponent,
            name: 'agLoadingOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
});

export const NoRowsOverlayModule = defineCommunityModule('NoRowsOverlayModule', {
    userComponents: [
        {
            classImp: NoRowsOverlayComponent,
            name: 'agNoRowsOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
});

export const OverlayModule = defineCommunityModule('OverlayModule', {
    dependsOn: [OverlayCoreModule, OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
});

import type { _OverlayGridApi } from '../../api/gridApi';
import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module, ModuleWithApi } from '../../interfaces/iModule';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

export const OverlayCoreModule: Module = {
    ...baseCommunityModule('OverlayCoreModule'),
    beans: [OverlayService],
};

export const OverlayApiModule: ModuleWithApi<_OverlayGridApi> = {
    ...baseCommunityModule('OverlayApiModule'),
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
    dependsOn: [OverlayCoreModule],
};

export const LoadingOverlayModule: Module = {
    ...baseCommunityModule('LoadingOverlayModule'),
    userComponents: [
        {
            classImp: LoadingOverlayComponent,
            name: 'agLoadingOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
};

export const NoRowsOverlayModule: Module = {
    ...baseCommunityModule('NoRowsOverlayModule'),
    userComponents: [
        {
            classImp: NoRowsOverlayComponent,
            name: 'agNoRowsOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
};

export const OverlayModule: Module = {
    ...baseCommunityModule('OverlayModule'),
    dependsOn: [OverlayCoreModule, OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
};

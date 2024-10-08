import type { _OverlayGridApi } from '../../api/gridApi';
import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../../interfaces/iModule';
import { LoadingOverlayComponent } from './loadingOverlayComponent';
import { NoRowsOverlayComponent } from './noRowsOverlayComponent';
import { hideOverlay, showLoadingOverlay, showNoRowsOverlay } from './overlayApi';
import { OverlayService } from './overlayService';

export const OverlayCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('OverlayCoreModule'),
    beans: [OverlayService],
};

export const OverlayApiModule: _ModuleWithApi<_OverlayGridApi> = {
    ...baseCommunityModule('OverlayApiModule'),
    apiFunctions: {
        showLoadingOverlay,
        showNoRowsOverlay,
        hideOverlay,
    },
    dependsOn: [OverlayCoreModule],
};

export const LoadingOverlayModule: _ModuleWithoutApi = {
    ...baseCommunityModule('LoadingOverlayModule'),
    userComponents: [
        {
            classImp: LoadingOverlayComponent,
            name: 'agLoadingOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
};

export const NoRowsOverlayModule: _ModuleWithoutApi = {
    ...baseCommunityModule('NoRowsOverlayModule'),
    userComponents: [
        {
            classImp: NoRowsOverlayComponent,
            name: 'agNoRowsOverlay',
        },
    ],
    dependsOn: [OverlayCoreModule],
};

export const OverlayModule: _ModuleWithoutApi = {
    ...baseCommunityModule('OverlayModule'),
    dependsOn: [OverlayCoreModule, OverlayApiModule, LoadingOverlayModule, NoRowsOverlayModule],
};

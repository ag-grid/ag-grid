import type { _CommunityMenuGridApi } from '../../api/gridApi';
import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module, ModuleWithApi } from '../../interfaces/iModule';
import { hidePopupMenu, showColumnMenu } from './menuApi';
import { MenuService } from './menuService';

export const SharedMenuModule: Module = {
    ...baseCommunityModule('SharedMenuModule'),
    beans: [MenuService],
};

export const CommunityMenuApiModule: ModuleWithApi<_CommunityMenuGridApi> = {
    ...baseCommunityModule('CommunityMenuApiModule'),
    apiFunctions: {
        showColumnMenu,
        hidePopupMenu,
    },
};

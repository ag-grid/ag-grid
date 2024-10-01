import type { _CommunityMenuGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import { hidePopupMenu, showColumnMenu } from './menuApi';
import { MenuService } from './menuService';

export const SharedMenuModule = defineCommunityModule('SharedMenuModule', {
    beans: [MenuService],
});

export const CommunityMenuApiModule = defineCommunityModule<_CommunityMenuGridApi>('CommunityMenuApiModule', {
    apiFunctions: {
        showColumnMenu,
        hidePopupMenu,
    },
});

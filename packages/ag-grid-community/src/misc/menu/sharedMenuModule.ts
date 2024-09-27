import type { _CommunityMenuGridApi } from '../../api/gridApi';
import { defineCommunityModule } from '../../interfaces/iModule';
import {
    hidePopupMenu,
    showColumnMenu,
    showColumnMenuAfterButtonClick,
    showColumnMenuAfterMouseClick,
} from './menuApi';
import { MenuService } from './menuService';

export const SharedMenuModule = defineCommunityModule('@ag-grid-community/shared-menu', {
    beans: [MenuService],
});

export const CommunityMenuApiModule = defineCommunityModule<_CommunityMenuGridApi>('@ag-grid-community/menu-api', {
    apiFunctions: {
        showColumnMenuAfterButtonClick,
        showColumnMenuAfterMouseClick,
        showColumnMenu,
        hidePopupMenu,
    },
});

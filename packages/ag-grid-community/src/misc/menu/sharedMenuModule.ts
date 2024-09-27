import type { _CommunityMenuGridApi } from '../../api/gridApi';
import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import {
    hidePopupMenu,
    showColumnMenu,
    showColumnMenuAfterButtonClick,
    showColumnMenuAfterMouseClick,
} from './menuApi';
import { MenuService } from './menuService';

export const SharedMenuModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/shared-menu',
    beans: [MenuService],
});

export const CommunityMenuApiModule = _defineModule<_CommunityMenuGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/menu-api',
    apiFunctions: {
        showColumnMenuAfterButtonClick,
        showColumnMenuAfterMouseClick,
        showColumnMenu,
        hidePopupMenu,
    },
});

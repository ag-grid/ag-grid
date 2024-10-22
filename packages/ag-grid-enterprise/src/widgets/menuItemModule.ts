import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { AgMenuItemRenderer } from './agMenuItemRenderer';

export const MenuItemModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('MenuItemModule'),
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
};

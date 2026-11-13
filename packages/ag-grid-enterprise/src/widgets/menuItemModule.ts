import type { _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import menuCSS from './menu.css';
import { MenuItemRenderer } from './menuItemRenderer';

/**
 * @internal
 */
export const MenuItemModule: _ModuleWithoutApi = {
    moduleName: 'MenuItem',
    version: VERSION,
    userComponents: {
        agMenuItem: MenuItemRenderer,
    },
    css: [menuCSS],
};

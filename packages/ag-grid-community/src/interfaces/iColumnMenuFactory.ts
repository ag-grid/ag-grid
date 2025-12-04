import type { DefaultMenuItem, MenuItemDef } from './menuItem';

export interface IColumnMenuFactory {
    /**
     * Returns a flat set of provided menu items names
     */
    flattenMenuItems(columnMainMenuItems: (DefaultMenuItem | MenuItemDef)[]): string[];
}

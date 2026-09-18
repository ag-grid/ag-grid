import type { DefaultColumnMenuItem } from '../interfaces/menuItem';

const ROW_PINNING_MENU_ITEMS = new Set<DefaultColumnMenuItem>(['pinRowSubMenu', 'pinTop', 'pinBottom', 'unpinRow']);

export function isRowPinningMenuItem(key: DefaultColumnMenuItem): boolean {
    return ROW_PINNING_MENU_ITEMS.has(key);
}

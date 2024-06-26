import type { IMenuActionParams, MenuItemDef, WithoutGridCommon } from '@ag-grid-community/core';
import { TabGuardComp } from '@ag-grid-community/core';
import type { AgMenuItemComponentEvent } from './agMenuItemComponent';
export type AgMenuListEvent = AgMenuItemComponentEvent;
export declare class AgMenuList extends TabGuardComp<AgMenuListEvent> {
    private readonly level;
    private menuItems;
    private activeMenuItem;
    private params;
    constructor(level?: number, params?: WithoutGridCommon<IMenuActionParams>);
    postConstruct(): void;
    private onTabKeyDown;
    private handleKeyDown;
    private handleFocusIn;
    private handleFocusOut;
    clearActiveItem(): void;
    addMenuItems(menuItems?: (MenuItemDef | string)[]): void;
    private addItem;
    activateFirstItem(): void;
    private createSeparator;
    private handleNavKey;
    private closeIfIsChild;
    private openChild;
    private findNextItem;
    destroy(): void;
}

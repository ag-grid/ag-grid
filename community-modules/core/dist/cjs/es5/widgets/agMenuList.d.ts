// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TabGuardComp } from "./tabGuardComp";
import { MenuItemDef } from "../entities/gridOptions";
export declare class AgMenuList extends TabGuardComp {
    private readonly level;
    private readonly focusService;
    private menuItems;
    private activeMenuItem;
    constructor(level?: number);
    private postConstruct;
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    clearActiveItem(): void;
    addMenuItems(menuItems?: (MenuItemDef | string)[]): void;
    addItem(menuItemDef: MenuItemDef): void;
    activateFirstItem(): void;
    private addSeparator;
    private findTopMenu;
    private handleNavKey;
    private closeIfIsChild;
    private openChild;
    private findNextItem;
    protected destroy(): void;
}

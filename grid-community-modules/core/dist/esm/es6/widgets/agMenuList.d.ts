// Type definitions for @ag-grid-community/core v31.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TabGuardComp } from "./tabGuardComp";
import { MenuItemDef } from "../interfaces/menuItem";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { IMenuActionParams } from "../interfaces/iCallbackParams";
export declare class AgMenuList extends TabGuardComp {
    private readonly level;
    private readonly focusService;
    private menuItems;
    private activeMenuItem;
    private params;
    constructor(level?: number, params?: WithoutGridCommon<IMenuActionParams>);
    private postConstruct;
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
    protected destroy(): void;
}

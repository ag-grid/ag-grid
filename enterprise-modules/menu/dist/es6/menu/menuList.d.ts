import { ManagedFocusComponent, MenuItemDef } from "@ag-grid-community/core";
export declare class MenuList extends ManagedFocusComponent {
    private readonly level;
    private readonly gridOptionsWrapper;
    private menuItems;
    private activeMenuItem;
    constructor(level?: number);
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

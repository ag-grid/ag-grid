// ag-grid-enterprise v20.2.0
import { Component, MenuItemDef } from "ag-grid-community";
export declare class MenuList extends Component {
    private popupService;
    private static TEMPLATE;
    private static SEPARATOR_TEMPLATE;
    private activeMenuItemParams;
    private activeMenuItem;
    private timerCount;
    private removeChildFuncs;
    private subMenuParentDef;
    constructor();
    clearActiveItem(): void;
    addMenuItems(menuItems: (MenuItemDef | string)[] | undefined): void;
    addItem(menuItemDef: MenuItemDef): void;
    private mouseEnterItem;
    private removeActiveItem;
    private addHoverForChildPopup;
    addSeparator(): void;
    private showChildMenu;
    private removeChildPopup;
    destroy(): void;
}

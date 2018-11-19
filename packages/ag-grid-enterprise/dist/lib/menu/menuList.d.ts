// ag-grid-enterprise v19.1.3
import { MenuItemDef, Component } from "ag-grid-community";
export declare class MenuList extends Component {
    private context;
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
    addMenuItems(menuItems: (MenuItemDef | string)[]): void;
    addItem(menuItemDef: MenuItemDef): void;
    private mouseEnterItem;
    private removeActiveItem;
    private addHoverForChildPopup;
    addSeparator(): void;
    private showChildMenu;
    private removeChildPopup;
    destroy(): void;
}
//# sourceMappingURL=menuList.d.ts.map
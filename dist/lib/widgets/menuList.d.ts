// Type definitions for ag-grid v5.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "./component";
import { MenuItem } from "./menuItemComponent";
export declare class MenuList extends Component {
    private context;
    private popupService;
    private static TEMPLATE;
    private static SEPARATOR_TEMPLATE;
    private activeMenuItemParams;
    private activeMenuItem;
    private timerCount;
    private showingChildMenu;
    private childPopupRemoveFunc;
    constructor();
    clearActiveItem(): void;
    addMenuItems(menuItems: (string | MenuItem)[], defaultMenuItems: {
        [key: string]: MenuItem;
    }): void;
    addItem(params: MenuItem): void;
    private mouseEnterItem(menuItemParams, menuItem);
    private removeActiveItem();
    private addHoverForChildPopup(menuItemParams, menuItem);
    private showChildMenu(menuItemParams, menuItem);
    addSeparator(): void;
    private removeOldChildPopup();
    destroy(): void;
}

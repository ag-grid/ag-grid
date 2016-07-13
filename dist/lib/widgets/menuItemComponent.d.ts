// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "./component";
import { MenuList } from "./menuList";
export declare class MenuItemComponent extends Component {
    private popupService;
    private static TEMPLATE;
    static EVENT_ITEM_SELECTED: string;
    private params;
    constructor(params: MenuItem);
    private onOptionSelected();
}
export interface MenuItem {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    childMenu?: MenuList;
}

// ag-grid-enterprise v16.0.1
import { MenuItemDef, Component, AgEvent } from "ag-grid";
export interface MenuItemSelectedEvent extends AgEvent {
    name: string;
    disabled: boolean;
    shortcut: string;
    action: () => void;
    checked: boolean;
    icon: HTMLElement | string;
    subMenu: (MenuItemDef | string)[];
    cssClasses: string[];
    tooltip: string;
    mouseEvent: MouseEvent;
}
export declare class MenuItemComponent extends Component {
    private gridOptionsWrapper;
    private static TEMPLATE;
    static EVENT_ITEM_SELECTED: string;
    private params;
    constructor(params: MenuItemDef);
    private init();
    private onOptionSelected(mouseEvent);
    destroy(): void;
}

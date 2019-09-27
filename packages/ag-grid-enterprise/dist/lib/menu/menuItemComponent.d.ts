// ag-grid-enterprise v21.2.2
import { AgEvent, Component, MenuItemDef } from "ag-grid-community";
export interface MenuItemSelectedEvent extends AgEvent {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    subMenu?: (MenuItemDef | string)[];
    cssClasses?: string[];
    tooltip?: string;
    mouseEvent: MouseEvent;
}
export declare class MenuItemComponent extends Component {
    private gridOptionsWrapper;
    private tooltipManager;
    private static TEMPLATE;
    private eIcon;
    private eName;
    private eShortcut;
    private ePopupPointer;
    static EVENT_ITEM_SELECTED: string;
    private params;
    private tooltip;
    constructor(params: MenuItemDef);
    private init;
    getTooltipText(): string;
    getComponentHolder(): undefined;
    private onOptionSelected;
    destroy(): void;
}

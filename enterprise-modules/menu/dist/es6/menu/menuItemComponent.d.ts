import { AgEvent, Component, MenuItemDef, IComponent, ITooltipParams } from "@ag-grid-community/core";
export interface MenuItemSelectedEvent extends AgEvent {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    subMenu?: (MenuItemDef | string)[] | IComponent<any>;
    cssClasses?: string[];
    tooltip?: string;
    event: MouseEvent | KeyboardEvent;
}
export interface MenuItemActivatedEvent extends AgEvent {
    menuItem: MenuItemComponent;
}
export interface MenuItemComponentParams extends MenuItemDef {
    isCompact?: boolean;
    isAnotherSubMenuOpen: () => boolean;
}
export declare class MenuItemComponent extends Component {
    private readonly params;
    private readonly gridOptionsWrapper;
    private readonly popupService;
    static EVENT_MENU_ITEM_SELECTED: string;
    static EVENT_MENU_ITEM_ACTIVATED: string;
    static ACTIVATION_DELAY: number;
    private isActive;
    private tooltip;
    private hideSubMenu;
    private subMenuIsOpen;
    private activateTimeoutId;
    private deactivateTimeoutId;
    constructor(params: MenuItemComponentParams);
    private init;
    isDisabled(): boolean;
    openSubMenu(activateFirstItem?: boolean): void;
    closeSubMenu(): void;
    isSubMenuOpen(): boolean;
    activate(openSubMenu?: boolean): void;
    deactivate(): void;
    private addIcon;
    private addName;
    private addTooltip;
    getTooltipParams(): ITooltipParams;
    private addShortcut;
    private addSubMenu;
    private onItemSelected;
    private onItemActivated;
    private cancelActivate;
    private cancelDeactivate;
    private onMouseEnter;
    private onMouseLeave;
    private getClassName;
}

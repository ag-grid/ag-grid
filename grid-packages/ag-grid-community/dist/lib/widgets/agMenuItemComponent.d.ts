import { AgEvent } from '../events';
import { IPopupComponent } from '../interfaces/iPopupComponent';
import { Component } from './component';
import { MenuItemLeafDef, MenuItemDef } from '../entities/gridOptions';
import { ITooltipParams } from '../rendering/tooltipComponent';
import { IComponent } from '../interfaces/iComponent';
import { WithoutGridCommon } from '../interfaces/iCommon';
interface MenuItemComponentParams extends MenuItemLeafDef {
    isCompact?: boolean;
    isAnotherSubMenuOpen: () => boolean;
    subMenu?: (MenuItemDef | string)[] | IComponent<any>;
}
export interface MenuItemSelectedEvent extends AgEvent {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    subMenu?: (MenuItemDef | string)[] | IPopupComponent<any>;
    cssClasses?: string[];
    tooltip?: string;
    event: MouseEvent | KeyboardEvent;
}
export interface MenuItemActivatedEvent extends AgEvent {
    menuItem: AgMenuItemComponent;
}
export declare class AgMenuItemComponent extends Component {
    private readonly params;
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
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
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
export {};

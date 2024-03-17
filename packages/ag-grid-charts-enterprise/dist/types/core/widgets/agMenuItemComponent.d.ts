import { Component } from './component';
import { AgEvent } from '../events';
import { BeanStub } from '../context/beanStub';
import { AgPromise } from '../utils/promise';
import { MenuItemDef } from '../interfaces/menuItem';
import { IComponent } from '../interfaces/iComponent';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { IMenuActionParams } from '../interfaces/iCallbackParams';
export interface CloseMenuEvent extends AgEvent {
    event?: MouseEvent | KeyboardEvent;
}
export interface MenuItemActivatedEvent extends AgEvent {
    menuItem: AgMenuItemComponent;
}
interface AgMenuItemComponentParams {
    menuItemDef: MenuItemDef;
    isAnotherSubMenuOpen: () => boolean;
    level: number;
    childComponent?: IComponent<any>;
    contextParams: WithoutGridCommon<IMenuActionParams>;
}
export declare class AgMenuItemComponent extends BeanStub {
    private readonly popupService;
    private readonly userComponentFactory;
    private readonly beans;
    static EVENT_CLOSE_MENU: string;
    static EVENT_MENU_ITEM_ACTIVATED: string;
    static ACTIVATION_DELAY: number;
    private eGui?;
    private params;
    private isAnotherSubMenuOpen;
    private level;
    private childComponent?;
    private contextParams;
    private menuItemComp;
    private isActive;
    private hideSubMenu;
    private subMenuIsOpen;
    private subMenuIsOpening;
    private activateTimeoutId;
    private deactivateTimeoutId;
    private parentComponent?;
    private tooltip?;
    private tooltipFeature?;
    private suppressRootStyles;
    private suppressAria;
    private suppressFocus;
    private cssClassPrefix;
    private eSubMenuGui?;
    init(params: AgMenuItemComponentParams): AgPromise<void>;
    private addListeners;
    isDisabled(): boolean;
    openSubMenu(activateFirstItem?: boolean): void;
    private setAriaExpanded;
    closeSubMenu(): void;
    isSubMenuOpen(): boolean;
    isSubMenuOpening(): boolean;
    activate(openSubMenu?: boolean): void;
    deactivate(): void;
    getGui(): HTMLElement;
    getParentComponent(): Component | undefined;
    setParentComponent(component: Component): void;
    getSubMenuGui(): HTMLElement | undefined;
    private onItemSelected;
    private closeMenu;
    private onItemActivated;
    private cancelActivate;
    private cancelDeactivate;
    private onMouseEnter;
    private onMouseLeave;
    private configureDefaults;
    private refreshTooltip;
    protected destroy(): void;
}
export {};

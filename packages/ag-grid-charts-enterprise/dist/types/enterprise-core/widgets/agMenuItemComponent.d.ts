import type { AgEvent, AgPromise, BeanCollection, Component, IComponent, IMenuActionParams, MenuItemDef, WithoutGridCommon } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export interface CloseMenuEvent extends AgEvent<'closeMenu'> {
    mouseEvent?: MouseEvent;
    keyboardEvent?: KeyboardEvent;
}
export interface MenuItemActivatedEvent extends AgEvent<'menuItemActivated'> {
    menuItem: AgMenuItemComponent;
}
interface AgMenuItemComponentParams {
    menuItemDef: MenuItemDef;
    isAnotherSubMenuOpen: () => boolean;
    level: number;
    childComponent?: IComponent<any>;
    contextParams: WithoutGridCommon<IMenuActionParams>;
}
export type AgMenuItemComponentEvent = 'closeMenu' | 'menuItemActivated';
export declare class AgMenuItemComponent extends BeanStub<AgMenuItemComponentEvent> {
    private popupService;
    private userComponentFactory;
    wireBeans(beans: BeanCollection): void;
    private ACTIVATION_DELAY;
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
    setParentComponent(component: Component<any>): void;
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
    destroy(): void;
}
export {};

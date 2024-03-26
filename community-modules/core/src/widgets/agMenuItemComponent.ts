import { AgMenuList } from './agMenuList';
import { AgMenuPanel } from './agMenuPanel';
import { Component } from './component';
import { PopupService } from './popupService';
import { KeyCode } from '../constants/keyCode';
import { Autowired } from '../context/context';
import { AgEvent } from '../events';
import { loadTemplate } from '../utils/dom';
import { setAriaDisabled, setAriaExpanded, setAriaLevel, setAriaRole } from '../utils/aria';
import { BeanStub } from '../context/beanStub';
import { UserComponentFactory } from '../components/framework/userComponentFactory';
import { AgPromise } from '../utils/promise';
import { TooltipFeature } from './tooltipFeature';
import { Beans } from '../rendering/beans';
import { IMenuConfigParams, IMenuItemComp,  MenuItemDef } from '../interfaces/menuItem';
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

export class AgMenuItemComponent extends BeanStub {
    @Autowired('popupService') private readonly popupService: PopupService;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;
    @Autowired('beans') private readonly beans: Beans;

    public static EVENT_CLOSE_MENU = 'closeMenu';
    public static EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    public static ACTIVATION_DELAY = 80;

    private eGui?: HTMLElement;
    private params: MenuItemDef;
    private isAnotherSubMenuOpen: () => boolean;
    private level: number;
    private childComponent?: IComponent<any>;
    private contextParams: WithoutGridCommon<IMenuActionParams>;
    private menuItemComp: IMenuItemComp;
    private isActive = false;
    private hideSubMenu: (() => void) | null;
    private subMenuIsOpen = false;
    private subMenuIsOpening = false;
    private activateTimeoutId: number;
    private deactivateTimeoutId: number;
    private parentComponent?: Component;
    private tooltip?: string;
    private tooltipFeature?: TooltipFeature;
    private suppressRootStyles: boolean = true;
    private suppressAria: boolean = true;
    private suppressFocus: boolean = true;
    private cssClassPrefix: string;
    private eSubMenuGui?: HTMLElement;

    public init(params: AgMenuItemComponentParams): AgPromise<void> {
        const { menuItemDef, isAnotherSubMenuOpen, level, childComponent, contextParams } = params;
        this.params = params.menuItemDef;
        this.level = level;
        this.isAnotherSubMenuOpen = isAnotherSubMenuOpen;
        this.childComponent = childComponent;
        this.contextParams = contextParams;
        this.cssClassPrefix = this.params.menuItemParams?.cssClassPrefix ?? 'ag-menu-option';
        const compDetails = this.userComponentFactory.getMenuItemCompDetails(this.params, {
            ...menuItemDef,
            level,
            isAnotherSubMenuOpen,
            openSubMenu: activateFirstItem => this.openSubMenu(activateFirstItem),
            closeSubMenu: () => this.closeSubMenu(),
            closeMenu: event => this.closeMenu(event),
            updateTooltip: (tooltip?: string, shouldDisplayTooltip?: () => boolean)  => this.refreshTooltip(tooltip, shouldDisplayTooltip),
            onItemActivated: () => this.onItemActivated()
        });
        return compDetails.newAgStackInstance().then((comp: IMenuItemComp) => {
            this.menuItemComp = comp;
            const configureDefaults = comp.configureDefaults?.();
            if (configureDefaults) {
                this.configureDefaults(configureDefaults === true ? undefined : configureDefaults);
            }
        });
    }

    private addListeners(eGui: HTMLElement, params?: IMenuConfigParams): void {
        if (!params?.suppressClick) {
            this.addManagedListener(eGui, 'click', e => this.onItemSelected(e));
        }
        if (!params?.suppressKeyboardSelect) {
            this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                    e.preventDefault();
                    this.onItemSelected(e);
                }
            });
        }
        if (!params?.suppressMouseDown) {
            this.addManagedListener(eGui, 'mousedown', e => {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });
        }
        if (!params?.suppressMouseOver) {
            this.addManagedListener(eGui, 'mouseenter', () => this.onMouseEnter());
            this.addManagedListener(eGui, 'mouseleave', () => this.onMouseLeave());
        }
    }

    public isDisabled(): boolean {
        return !!this.params.disabled;
    }

    public openSubMenu(activateFirstItem = false): void {
        this.closeSubMenu();

        if (!this.params.subMenu) { return; }

        this.subMenuIsOpening = true;

        const ePopup = loadTemplate(/* html */ `<div class="ag-menu" role="presentation"></div>`);
        this.eSubMenuGui = ePopup;
        let destroySubMenu: () => void;
        let afterGuiAttached = () => {
            this.subMenuIsOpening = false;
        };

        if (this.childComponent) {
            const menuPanel = this.createBean(new AgMenuPanel(this.childComponent));
            menuPanel.setParentComponent(this as any);

            const subMenuGui = menuPanel.getGui();
            const mouseEvent = 'mouseenter';
            const mouseEnterListener = () => this.cancelDeactivate();

            subMenuGui.addEventListener(mouseEvent, mouseEnterListener);

            destroySubMenu = () => subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);

            ePopup.appendChild(subMenuGui);

            if ((this.childComponent as any).afterGuiAttached) {
                afterGuiAttached = () => {
                    (this.childComponent as any).afterGuiAttached!();
                    this.subMenuIsOpening = false;
                };
            }
        } else if (this.params.subMenu) {
            const childMenu = this.createBean(new AgMenuList(this.level + 1, this.contextParams));

            childMenu.setParentComponent(this as any);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());

            // bubble menu item selected events
            this.addManagedListener(childMenu, AgMenuItemComponent.EVENT_CLOSE_MENU, e => this.dispatchEvent(e));
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());

            destroySubMenu = () => this.destroyBean(childMenu);

            if (activateFirstItem) {
                afterGuiAttached = () => {
                    childMenu.activateFirstItem();
                    this.subMenuIsOpening = false;
                };
            }
        }

        const positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService,
            { eventSource: this.eGui, ePopup });

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: this.eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu'),
            afterGuiAttached
        });

        this.subMenuIsOpen = true;
        this.setAriaExpanded(true);

        this.hideSubMenu = () => {
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            this.subMenuIsOpen = false;
            this.setAriaExpanded(false);
            destroySubMenu();
            this.menuItemComp.setExpanded?.(false);
            this.eSubMenuGui = undefined;
        };

        this.menuItemComp.setExpanded?.(true);
    }

    private setAriaExpanded(expanded: boolean): void {
        if (!this.suppressAria) {
            setAriaExpanded(this.eGui!, expanded);
        }
    }

    public closeSubMenu(): void {
        if (!this.hideSubMenu) { return; }
        this.hideSubMenu();
        this.hideSubMenu = null;
        this.setAriaExpanded(false);
    }

    public isSubMenuOpen(): boolean {
        return this.subMenuIsOpen;
    }

    public isSubMenuOpening(): boolean {
        return this.subMenuIsOpening;
    }

    public activate(openSubMenu?: boolean): void {
        this.cancelActivate();

        if (this.params.disabled) { return; }

        this.isActive = true;
        if (!this.suppressRootStyles) {
            this.eGui!.classList.add(`${this.cssClassPrefix}-active`);
        }
        this.menuItemComp.setActive?.(true);
        if (!this.suppressFocus) {
            this.eGui!.focus({ preventScroll: true });
        }

        if (openSubMenu && this.params.subMenu) {
            window.setTimeout(() => {
                if (this.isAlive() && this.isActive) {
                    this.openSubMenu();
                }
            }, 300);
        }

        this.onItemActivated();
    }

    public deactivate() {
        this.cancelDeactivate();
        if (!this.suppressRootStyles) {
            this.eGui!.classList.remove(`${this.cssClassPrefix}-active`);
        }
        this.menuItemComp.setActive?.(false);
        this.isActive = false;

        if (this.subMenuIsOpen) {
            this.hideSubMenu!();
        }
    }

    public getGui(): HTMLElement {
        return this.menuItemComp.getGui();
    }

    public getParentComponent(): Component | undefined {
        return this.parentComponent;
    }

    public setParentComponent(component: Component): void {
        this.parentComponent = component;
    }

    public getSubMenuGui(): HTMLElement | undefined {
        return this.eSubMenuGui;
    }

    private onItemSelected(event: MouseEvent | KeyboardEvent): void {
        this.menuItemComp.select?.();
        if (this.params.action) {
            this.getFrameworkOverrides().wrapOutgoing(() => this.params.action!(this.gos.addGridCommonParams({
                ...this.contextParams
            })));
        } else {
            this.openSubMenu(event && event.type === 'keydown');
        }

        if ((this.params.subMenu && !this.params.action) || this.params.suppressCloseOnSelect) { return; }

        this.closeMenu(event);
    }
    
    private closeMenu(event?: MouseEvent | KeyboardEvent): void {
        const e: CloseMenuEvent = {
            type: AgMenuItemComponent.EVENT_CLOSE_MENU,
            event
        };
    
        this.dispatchEvent(e);    
    }

    private onItemActivated(): void {
        const event: MenuItemActivatedEvent = {
            type: AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED,
            menuItem: this,
        };

        this.dispatchEvent(event);
    }

    private cancelActivate(): void {
        if (this.activateTimeoutId) {
            window.clearTimeout(this.activateTimeoutId);
            this.activateTimeoutId = 0;
        }
    }

    private cancelDeactivate(): void {
        if (this.deactivateTimeoutId) {
            window.clearTimeout(this.deactivateTimeoutId);
            this.deactivateTimeoutId = 0;
        }
    }

    private onMouseEnter(): void {
        this.cancelDeactivate();

        if (this.isAnotherSubMenuOpen()) {
            // wait to see if the user enters the open sub-menu
            this.activateTimeoutId = window.setTimeout(() => this.activate(true), AgMenuItemComponent.ACTIVATION_DELAY);
        } else {
            // activate immediately
            this.activate(true);
        }
    }

    private onMouseLeave(): void {
        this.cancelActivate();

        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(() => this.deactivate(), AgMenuItemComponent.ACTIVATION_DELAY);
        } else {
            // de-activate immediately
            this.deactivate();
        }
    }

    private configureDefaults(params?: IMenuConfigParams): void {
        this.tooltip = this.params.tooltip;

        if (!this.menuItemComp) {
            // need to wait for init to complete
            setTimeout(() => this.configureDefaults(params));
            return;
        }

        let eGui = this.menuItemComp.getGui();
        // in some frameworks, `getGui` might be a framework element
        const rootElement = (this.menuItemComp as any).getRootElement?.() as HTMLElement | undefined;
        if (rootElement) {
            if (!params?.suppressRootStyles) {
                eGui.classList.add('ag-menu-option-custom');
            }
            eGui = rootElement;
        }
        this.eGui = eGui;

        this.suppressRootStyles = !!params?.suppressRootStyles;
        if (!this.suppressRootStyles) {
            eGui.classList.add(this.cssClassPrefix);
            this.params.cssClasses?.forEach(it => eGui.classList.add(it));
            if (this.params.disabled) {
                eGui.classList.add(`${this.cssClassPrefix}-disabled`);
            }
        }
        if (!params?.suppressTooltip) {
            this.refreshTooltip();
        }
        this.suppressAria = !!params?.suppressAria;
        if (!this.suppressAria) {
            setAriaRole(eGui, 'treeitem');
            setAriaLevel(eGui, this.level + 1);
            if (this.params.disabled) {
                setAriaDisabled(eGui, true);
            }
        }
        if (!params?.suppressTabIndex) {
            eGui.setAttribute('tabindex', '-1');
        }
        if (!this.params.disabled) {
            this.addListeners(eGui, params);
        }
        this.suppressFocus = !!params?.suppressFocus;
    }

    private refreshTooltip(tooltip?: string, shouldDisplayTooltip?: () => boolean): void {
        this.tooltip = tooltip;

        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }

        if (!tooltip || !this.menuItemComp) {
            return;
        }

        this.tooltipFeature = this.createBean(new TooltipFeature({
            getGui: () => this.getGui(),
            getTooltipValue: () => this.tooltip,
            getLocation: () => 'menu',
            shouldDisplayTooltip
        }));
    }

    protected destroy(): void {
        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }
        super.destroy();
    }
}

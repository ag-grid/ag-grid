import type {
    AgEvent,
    AgPromise,
    IComponent,
    IMenuConfigParams,
    IMenuItem,
    _AgComponent,
    _AgCoreBean,
    _AgCoreBeanCollection,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
    _ITooltipFeature,
    _StopPropagationCallbacks,
    _TooltipCtrl,
    _WithoutCommon,
} from 'ag-grid-community';
import {
    KeyCode,
    _AgBeanStub,
    _createElement,
    _setAriaDisabled,
    _setAriaExpanded,
    _setAriaHasPopup,
    _setAriaRole,
} from 'ag-grid-community';

import { AgMenuList } from './agMenuList';
import { AgMenuPanel } from './agMenuPanel';

export interface AgMenuItemLeafDef<TMenuActionParams extends TCommon, TCommon> {
    /** Name of the menu item. */
    name: string;
    /** Set to `true` to display the menu item as disabled. */
    disabled?: boolean;
    /**
     * Shortcut text displayed inside menu item.
     * Setting this doesn’t actually create a keyboard shortcut binding.
     */
    shortcut?: string;
    /** Function that gets executed when item is chosen. */
    action?: (params: TMenuActionParams) => void;
    /** Set to true to provide a check beside the option. */
    checked?: boolean;
    /** The icon to display, either a DOM element or HTML string. */
    icon?: Element | string;
    /** CSS classes to apply to the menu item. */
    cssClasses?: string[];
    /** Tooltip text to be displayed for the menu item. */
    tooltip?: string;
    /**
     * If `true`, will keep the menu open when the item is selected.
     * Note that if this item has a sub menu,
     * it will always remain open regardless of this property.
     */
    suppressCloseOnSelect?: boolean;
}

export interface AgMenuItemDef<TMenuActionParams extends TCommon, TCommon>
    extends AgMenuItemLeafDef<TMenuActionParams, TCommon> {
    /**
     * If this item is a sub menu, contains a list of menu item definitions */
    subMenu?: (AgMenuItemDef<TMenuActionParams, TCommon> | string)[];
    /**
     * The aria role for the subMenu
     * @default 'menu'
     */
    subMenuRole?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    /**
     * Provide a custom menu item component.
     * See [Menu Item Component](https://www.ag-grid.com/javascript-data-grid/component-menu-item/#implementing-a-menu-item-component) for framework specific implementation details.
     */
    menuItem?: any;
    /**
     * Parameters to be passed to the custom menu item component specified in `menuItem`.
     */
    menuItemParams?: any;
}

export interface AgCloseMenuEvent extends AgEvent<'closeMenu'> {
    mouseEvent?: MouseEvent;
    keyboardEvent?: KeyboardEvent;
}

export interface AgMenuItemActivatedEvent<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TMenuActionParams extends TCommon,
> extends AgEvent<'menuItemActivated'> {
    menuItem: AgMenuItemComponent<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TMenuActionParams
    >;
}

interface AgMenuItemComponentParams<TMenuActionParams extends TCommon, TCommon> {
    menuItemDef: AgMenuItemDef<TMenuActionParams, TCommon>;
    isAnotherSubMenuOpen: () => boolean;
    level: number;
    childComponent?: IComponent<any>;
    contextParams: _WithoutCommon<TCommon, TMenuActionParams>;
}

export type AgMenuItemComponentEvent = 'closeMenu' | 'menuItemActivated';

export interface AgMenuItemParams<TMenuActionParams extends TCommon, TCommon>
    extends AgMenuItemDef<TMenuActionParams, TCommon> {
    /** Level within the menu tree (starts at 0). */
    level: number;
    /** Returns `true` if another sub menu is open. */
    isAnotherSubMenuOpen: () => boolean;
    /**
     * Open the sub menu for this item.
     * @param activateFirstItem If `true`, activate the first item in the sub menu.
     */
    openSubMenu: (activateFirstItem?: boolean) => void;
    /** Close the sub menu for this item. */
    closeSubMenu: () => void;
    /** Close the entire menu. */
    closeMenu: (event?: KeyboardEvent | MouseEvent) => void;
    /**
     * Updates the grid-provided tooltip this component.
     * @param tooltip The value to be displayed by the tooltip
     * @param shouldDisplayTooltip A function returning a boolean that allows the tooltip to be displayed conditionally. This option does not work when `enableBrowserTooltips={true}`.
     */
    updateTooltip: (tooltip?: string, shouldDisplayTooltip?: () => boolean) => void;
    /**
     * Callback to let the menu know that the current item has become active.
     * Required if updating the active status within the menu item.
     */
    onItemActivated: () => void;
}

export interface AgMenuItemCallbacks<TBeanCollection, TMenuActionParams extends TCommon, TCommon> {
    getMenuItemComp: (
        beans: TBeanCollection,
        def: AgMenuItemDef<TMenuActionParams, TCommon>,
        params: AgMenuItemParams<TMenuActionParams, TCommon>
    ) => AgPromise<(IComponent<AgMenuItemParams<TMenuActionParams, TCommon>> & IMenuItem) | undefined>;
    getPostProcessPopupParams: (contextParams: _WithoutCommon<TCommon, TMenuActionParams>) => any;
    preserveRangesWhile: (beans: TBeanCollection, fn: () => void) => void;
    stopPropagationCallbacks: _StopPropagationCallbacks;
    warnNoItem?: (menuItem: string) => void;
}

export class AgMenuItemComponent<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TMenuActionParams extends TCommon,
> extends _AgBeanStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    AgMenuItemComponentEvent
> {
    private readonly ACTIVATION_DELAY = 80;

    private eGui: HTMLElement;
    private params: AgMenuItemDef<TMenuActionParams, TCommon>;
    private isAnotherSubMenuOpen: () => boolean;
    private level: number;
    private childComponent?: IComponent<any>;
    private contextParams: _WithoutCommon<TCommon, TMenuActionParams>;
    private menuItemComp: IComponent<AgMenuItemParams<TMenuActionParams, TCommon>> & IMenuItem;
    private isActive = false;
    private hideSubMenu: (() => void) | null;
    private subMenuIsOpen = false;
    private subMenuIsOpening = false;
    private activateTimeoutId: number;
    private deactivateTimeoutId: number;
    private parentComponent?: _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>;
    private tooltip?: string;
    private tooltipFeature?: _ITooltipFeature;
    private suppressRootStyles: boolean = true;
    private suppressAria: boolean = true;
    private suppressFocus: boolean = true;
    private cssClassPrefix: string;
    private eSubMenuGui?: HTMLElement;

    constructor(private readonly callbacks: AgMenuItemCallbacks<TBeanCollection, TMenuActionParams, TCommon>) {
        super();
    }

    public init(params: AgMenuItemComponentParams<TMenuActionParams, TCommon>): AgPromise<void> {
        const { menuItemDef, isAnotherSubMenuOpen, level, childComponent, contextParams } = params;
        this.params = params.menuItemDef;
        this.level = level;
        this.isAnotherSubMenuOpen = isAnotherSubMenuOpen;
        this.childComponent = childComponent;
        this.contextParams = contextParams;
        this.cssClassPrefix = this.params.menuItemParams?.cssClassPrefix ?? 'ag-menu-option';
        return this.callbacks
            .getMenuItemComp(this.beans, this.params, {
                ...menuItemDef,
                level,
                isAnotherSubMenuOpen,
                openSubMenu: (activateFirstItem) => this.openSubMenu(activateFirstItem),
                closeSubMenu: () => this.closeSubMenu(),
                closeMenu: (event) => this.closeMenu(event),
                updateTooltip: (tooltip, shouldDisplayTooltip) => this.refreshTooltip(tooltip, shouldDisplayTooltip),
                onItemActivated: () => this.onItemActivated(),
            })
            .then((comp: (IComponent<AgMenuItemParams<TMenuActionParams, TCommon>> & IMenuItem) | undefined) => {
                if (!comp) {
                    return;
                }
                this.menuItemComp = comp;
                const configureDefaults = comp.configureDefaults?.();
                if (configureDefaults) {
                    this.configureDefaults(configureDefaults === true ? undefined : configureDefaults);
                }
            });
    }

    private addListeners(eGui: HTMLElement, params?: IMenuConfigParams): void {
        if (!params?.suppressClick) {
            this.addManagedElementListeners(eGui, { click: (e) => this.onItemSelected(e!) });
        }
        if (!params?.suppressKeyboardSelect) {
            this.addManagedElementListeners(eGui, {
                keydown: (e: KeyboardEvent) => {
                    if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                        e.preventDefault();
                        this.onItemSelected(e);
                    }
                },
            });
        }
        if (!params?.suppressMouseDown) {
            this.addManagedElementListeners(eGui, {
                mousedown: (e: MouseEvent) => {
                    // Prevent event bubbling to other event handlers such as PopupService triggering
                    // premature closing of any open sub-menu popup.
                    e.stopPropagation();
                    e.preventDefault();
                },
            });
        }
        if (!params?.suppressMouseOver) {
            this.addManagedElementListeners(eGui, {
                mouseenter: () => this.onMouseEnter(),
                mouseleave: () => this.onMouseLeave(),
            });
        }
    }

    public isDisabled(): boolean {
        return !!this.params.disabled;
    }

    public openSubMenu(activateFirstItem = false, event?: MouseEvent | KeyboardEvent): void {
        this.closeSubMenu();

        if (!this.params.subMenu) {
            return;
        }

        this.subMenuIsOpening = true;

        const ePopup = _createElement({ tag: 'div', cls: 'ag-menu', role: 'presentation' });
        this.eSubMenuGui = ePopup;
        let destroySubMenu: () => void;
        let afterGuiAttached = () => {
            this.subMenuIsOpening = false;
        };

        if (this.childComponent) {
            const menuPanel = this.createBean(
                new AgMenuPanel<
                    TBeanCollection,
                    TProperties,
                    TGlobalEvents,
                    TCommon,
                    TPropertiesService,
                    TComponentSelectorType
                >(this.childComponent)
            );
            menuPanel.setParentComponent(this as any);

            const subMenuGui = menuPanel.getGui();
            const mouseEvent = 'mouseenter';
            const mouseEnterListener = () => this.cancelDeactivate();

            subMenuGui.addEventListener(mouseEvent, mouseEnterListener);

            destroySubMenu = () => {
                subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);
                this.destroyBean(menuPanel);
            };

            ePopup.appendChild(subMenuGui);

            if ((this.childComponent as any).afterGuiAttached) {
                afterGuiAttached = () => {
                    (this.childComponent as any).afterGuiAttached!();
                    this.subMenuIsOpening = false;
                };
            }
        } else if (this.params.subMenu) {
            const childMenu = this.createBean(
                new AgMenuList<
                    TBeanCollection,
                    TProperties,
                    TGlobalEvents,
                    TCommon,
                    TPropertiesService,
                    TComponentSelectorType,
                    TMenuActionParams
                >(this.level + 1, this.contextParams, this.callbacks)
            );

            childMenu.setParentComponent(this as any);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());

            // bubble menu item selected events
            this.addManagedListeners(childMenu, { closeMenu: (e) => this.dispatchLocalEvent(e) });
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());

            destroySubMenu = () => this.destroyBean(childMenu);

            if (activateFirstItem) {
                afterGuiAttached = () => {
                    childMenu.activateFirstItem();
                    this.subMenuIsOpening = false;
                };
            }
        }

        const popupSvc = this.beans.popupSvc;
        const positionCallback = () => {
            const eventSource = this.eGui;
            popupSvc?.positionPopupForMenu({
                eventSource,
                ePopup,
                event: event instanceof MouseEvent ? event : undefined,
                additionalParams: this.callbacks.getPostProcessPopupParams(this.contextParams),
            });
        };

        const translate = this.getLocaleTextFunc();

        const addPopupRes = popupSvc?.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback,
            anchorToElement: this.eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu'),
            afterGuiAttached,
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
            _setAriaExpanded(this.eGui, expanded);
        }
    }

    public closeSubMenu(): void {
        if (!this.hideSubMenu) {
            return;
        }

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

    public activate(openSubMenu?: boolean, fromKeyNav?: boolean): void {
        this.cancelActivate();

        if (this.params.disabled && !fromKeyNav) {
            return;
        }

        this.isActive = true;
        if (!this.suppressRootStyles) {
            this.eGui.classList.add(`${this.cssClassPrefix}-active`);
        }
        this.menuItemComp.setActive?.(true);
        if (!this.suppressFocus) {
            this.callbacks.preserveRangesWhile(this.beans, () => this.eGui.focus({ preventScroll: !fromKeyNav }));
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
            this.eGui.classList.remove(`${this.cssClassPrefix}-active`);
        }
        this.menuItemComp.setActive?.(false);
        this.isActive = false;

        if (this.subMenuIsOpen) {
            this.closeSubMenu();
        }
    }

    public getGui(): HTMLElement {
        return this.menuItemComp.getGui();
    }

    public getParentComponent(): _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | undefined {
        return this.parentComponent;
    }

    public setParentComponent(component: _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>): void {
        this.parentComponent = component;
    }

    public getSubMenuGui(): HTMLElement | undefined {
        return this.eSubMenuGui;
    }

    private onItemSelected(event: MouseEvent | KeyboardEvent): void {
        this.menuItemComp.select?.();
        if (this.params.action) {
            this.beans.frameworkOverrides.wrapOutgoing(() =>
                this.params.action!(
                    this.gos.addCommon({
                        ...this.contextParams,
                    })
                )
            );
        } else {
            this.openSubMenu(event && event.type === 'keydown', event);
        }

        if ((this.params.subMenu && !this.params.action) || this.params.suppressCloseOnSelect) {
            return;
        }

        this.closeMenu(event);
    }

    private closeMenu(event?: MouseEvent | KeyboardEvent): void {
        const e: AgCloseMenuEvent = {
            type: 'closeMenu',
        };

        if (event) {
            if (event instanceof MouseEvent) {
                e.mouseEvent = event;
            } else {
                e.keyboardEvent = event;
            }
        }

        this.dispatchLocalEvent(e);
    }

    private onItemActivated(): void {
        const event: AgMenuItemActivatedEvent<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            TMenuActionParams
        > = {
            type: 'menuItemActivated',
            menuItem: this,
        };

        this.dispatchLocalEvent(event);
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
            this.activateTimeoutId = window.setTimeout(() => this.activate(true), this.ACTIVATION_DELAY);
        } else {
            // activate immediately
            this.activate(true);
        }
    }

    private onMouseLeave(): void {
        this.cancelActivate();

        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(() => this.deactivate(), this.ACTIVATION_DELAY);
        } else {
            // de-activate immediately
            this.deactivate();
        }
    }

    private refreshRootElementGui(suppressRootStyles: boolean): HTMLElement {
        let eGui = this.menuItemComp.getGui();
        const {
            cssClassPrefix,
            params: { cssClasses, disabled },
        } = this;
        // in some frameworks, `getGui` might be a framework element
        const rootElement = (this.menuItemComp as any).getRootElement?.() as HTMLElement | undefined;

        if (rootElement) {
            if (!suppressRootStyles) {
                eGui.classList.add('ag-menu-option-custom');
            }
            eGui = rootElement;
        }

        this.suppressRootStyles = !!suppressRootStyles;
        if (!this.suppressRootStyles) {
            eGui.classList.add(cssClassPrefix);
            for (const it of cssClasses ?? []) {
                eGui.classList.add(it);
            }
            if (disabled) {
                eGui.classList.add(`${cssClassPrefix}-disabled`);
            }
        }

        return eGui;
    }

    private applyAriaProperties(eGui: HTMLElement): void {
        const {
            params: { checked, subMenu, subMenuRole, disabled },
        } = this;

        const hasCheck = checked != null;
        _setAriaRole(eGui, hasCheck ? 'menuitemcheckbox' : 'menuitem');

        if (subMenu) {
            _setAriaHasPopup(eGui, subMenuRole ?? 'menu');
        }

        if (disabled) {
            _setAriaDisabled(eGui, true);
        }
    }

    private configureDefaults(configParams?: IMenuConfigParams): void {
        if (!this.menuItemComp) {
            // need to wait for init to complete
            setTimeout(() => this.configureDefaults(configParams));
            return;
        }

        const { suppressRootStyles, suppressTooltip, suppressAria, suppressTabIndex, suppressFocus } =
            configParams || {};
        const {
            params: { tooltip, disabled },
        } = this;

        const eGui = (this.eGui = this.refreshRootElementGui(!!suppressRootStyles));

        this.suppressAria = !!suppressAria;

        if (!suppressAria) {
            this.applyAriaProperties(eGui);
        }

        if (!suppressTabIndex) {
            eGui.setAttribute('tabindex', '-1');
        }

        if (!suppressTooltip) {
            this.refreshTooltip(tooltip);
        }

        if (!disabled) {
            this.addListeners(eGui, configParams);
        }

        this.suppressFocus = !!suppressFocus;
    }

    private refreshTooltip(tooltip?: string, shouldDisplayTooltip?: () => boolean): void {
        this.tooltip = tooltip;

        this.tooltipFeature = this.destroyBean(this.tooltipFeature);

        if (!tooltip || !this.menuItemComp) {
            return;
        }

        const tooltipFeature = this.beans.registry.createDynamicBean<_ITooltipFeature & _AgCoreBean<TBeanCollection>>(
            'tooltipFeature',
            false,
            {
                getGui: () => this.getGui(),
                getTooltipValue: () => this.tooltip,
                getLocation: () => 'menu',
                shouldDisplayTooltip,
            } as _TooltipCtrl<string, any>
        );

        if (tooltipFeature) {
            this.tooltipFeature = this.createBean(tooltipFeature);
        }
    }

    public override destroy(): void {
        this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        this.menuItemComp?.destroy?.();
        super.destroy();
    }
}

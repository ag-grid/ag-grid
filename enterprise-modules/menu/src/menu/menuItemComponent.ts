import {
    AgEvent,
    Autowired,
    Component,
    Constants,
    GridOptionsWrapper,
    MenuItemDef,
    PostConstruct,
    TooltipFeature,
    _,
    PopupService,
    IComponent
} from "@ag-grid-community/core";
import { MenuList } from './menuList';

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
    excludeUnusedItems?: boolean;
    isAnotherSubMenuOpen: () => boolean;
}

export class MenuItemComponent extends Component {
    @Autowired('gridOptionsWrapper') private readonly gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('popupService') private readonly popupService: PopupService;

    public static EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
    public static EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    public static ACTIVATION_DELAY = 80;
    private static ACTIVE_CLASS = 'ag-menu-option-active';

    private tooltip: string;
    private hideSubMenu: () => void;
    private subMenuIsOpen = false;
    private activateTimeoutId: number;
    private deactivateTimeoutId: number;

    constructor(private readonly params: MenuItemComponentParams) {
        super(/* html */`<div class="ag-menu-option" tabindex="-1" role="listitem"></div>`);
    }

    @PostConstruct
    private init() {
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
        this.addTooltip();

        if (this.params.disabled) {
            this.addCssClass('ag-menu-option-disabled');
        } else {
            this.addGuiEventListener('click', e => this.onItemSelected(e));
            this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
                if (e.keyCode === Constants.KEY_ENTER || e.keyCode === Constants.KEY_SPACE) {
                    this.onItemSelected(e);
                }
            });

            this.addGuiEventListener('mouseenter', () => this.onMouseEnter());
            this.addGuiEventListener('mouseleave', () => this.onMouseLeave());
        }

        if (this.params.cssClasses) {
            const gui = this.getGui();

            this.params.cssClasses.forEach(it => _.addCssClass(gui, it));
        }
    }

    public getTooltipText(): string {
        return this.tooltip;
    }

    public getComponentHolder(): undefined {
        return undefined;
    }

    public isDisabled(): boolean {
        return !!this.params.disabled;
    }

    public openSubMenu(activateFirstItem = false): void {
        this.closeSubMenu();

        if (!this.params.subMenu) { return; }

        const ePopup = _.loadTemplate(/* html */`<div class="ag-menu" tabindex="-1"></div>`);
        let destroySubMenu: () => void;

        if (this.params.subMenu instanceof Array) {
            const childMenu = this.createBean(new MenuList());

            childMenu.setParentComponent(this);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());

            // bubble menu item selected events
            this.addManagedListener(childMenu, MenuItemComponent.EVENT_MENU_ITEM_SELECTED, e => this.dispatchEvent(e));
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());

            destroySubMenu = () => this.destroyBean(childMenu);

            if (activateFirstItem) {
                setTimeout(() => childMenu.activateFirstItem(), 0);
            }
        } else {
            const subMenuGui = this.params.subMenu.getGui();
            const mouseEnterListener = () => this.cancelDeactivate();

            subMenuGui.addEventListener('mouseenter', mouseEnterListener);

            destroySubMenu = () => subMenuGui.removeEventListener('mouseenter', mouseEnterListener);

            ePopup.appendChild(this.params.subMenu.getGui());
        }

        const closePopup = this.popupService.addAsModalPopup(ePopup, false);

        this.subMenuIsOpen = true;

        this.hideSubMenu = () => {
            closePopup();
            this.subMenuIsOpen = false;
            destroySubMenu();
        };

        this.popupService.positionPopupForMenu({ eventSource: this.getGui(), ePopup });
    }

    public closeSubMenu(): void {
        if (this.hideSubMenu) {
            this.hideSubMenu();
            this.hideSubMenu = null;
        }
    }

    public isActive(): boolean {
        return _.containsClass(this.getGui(), MenuItemComponent.ACTIVE_CLASS);
    }

    public isSubMenuOpen(): boolean {
        return this.subMenuIsOpen;
    }

    public activate(openSubMenu?: boolean): void {
        this.cancelActivate();

        if (this.params.disabled) { return; }

        this.addCssClass(MenuItemComponent.ACTIVE_CLASS);
        this.getGui().focus();

        if (openSubMenu && this.params.subMenu) {
            window.setTimeout(() => {
                if (this.isAlive() && this.isActive()) {
                    this.openSubMenu();
                }
            }, 300);
        }

        this.onItemActivated();
    }

    public deactivate() {
        this.cancelDeactivate();
        this.removeCssClass(MenuItemComponent.ACTIVE_CLASS);

        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    }

    private addIcon(): void {
        if (this.params.checked || this.params.icon || !this.params.excludeUnusedItems) {
            const icon = _.loadTemplate(/* html */
                `<span ref="eIcon" class="ag-menu-option-part ag-menu-option-icon" role="presentation"></span>`);

            if (this.params.checked) {
                icon.appendChild(_.createIconNoSpan('check', this.gridOptionsWrapper));
            } else if (this.params.icon) {
                if (_.isNodeOrElement(this.params.icon)) {
                    icon.appendChild(this.params.icon as HTMLElement);
                } else if (typeof this.params.icon === 'string') {
                    icon.innerHTML = this.params.icon;
                } else {
                    console.warn('ag-Grid: menu item icon must be DOM node or string');
                }
            }

            this.getGui().appendChild(icon);
        }
    }

    private addName(): void {
        if (this.params.name || !this.params.excludeUnusedItems) {
            const name = _.loadTemplate(/* html */
                `<span ref="eName" class="ag-menu-option-part ag-menu-option-text">${this.params.name || ''}</span>`);

            this.getGui().appendChild(name);
        }
    }

    private addTooltip(): void {
        if (this.params.tooltip) {
            this.tooltip = this.params.tooltip;

            if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                this.getGui().setAttribute('title', this.tooltip);
            } else {
                this.createManagedBean(new TooltipFeature(this, 'menu'));
            }
        }
    }

    private addShortcut(): void {
        if (this.params.shortcut || !this.params.excludeUnusedItems) {
            const shortcut = _.loadTemplate(/* html */
                `<span ref="eShortcut" class="ag-menu-option-part ag-menu-option-shortcut">${this.params.shortcut || ''}</span>`);

            this.getGui().appendChild(shortcut);
        }
    }

    private addSubMenu(): void {
        if (this.params.subMenu || !this.params.excludeUnusedItems) {
            const pointer = _.loadTemplate(/* html */
                `<span ref="ePopupPointer" class="ag-menu-option-part ag-menu-option-popup-pointer"></span>`);

            if (this.params.subMenu) {
                const iconName = this.gridOptionsWrapper.isEnableRtl() ? 'smallLeft' : 'smallRight';

                pointer.appendChild(_.createIconNoSpan(iconName, this.gridOptionsWrapper));
            }

            this.getGui().appendChild(pointer);
        }
    }

    private onItemSelected(event: MouseEvent | KeyboardEvent): void {
        if (this.params.action) {
            this.params.action();
        } else {
            this.openSubMenu(event && event.type === 'keydown');
        }

        if (!this.params.subMenu || this.params.action) {
            const e: MenuItemSelectedEvent = {
                type: MenuItemComponent.EVENT_MENU_ITEM_SELECTED,
                action: this.params.action,
                checked: this.params.checked,
                cssClasses: this.params.cssClasses,
                disabled: this.params.disabled,
                icon: this.params.icon,
                name: this.params.name,
                shortcut: this.params.shortcut,
                subMenu: this.params.subMenu,
                tooltip: this.params.tooltip,
                event
            };

            this.dispatchEvent(e);
        }
    }

    private onItemActivated(): void {
        const event: MenuItemActivatedEvent = {
            type: MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED,
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

        if (this.params.isAnotherSubMenuOpen()) {
            // wait to see if the user enters the open sub-menu
            this.activateTimeoutId = window.setTimeout(() => this.activate(true), MenuItemComponent.ACTIVATION_DELAY);
        } else {
            // activate immediately
            this.activate(true);
        }
    }

    private onMouseLeave(): void {
        this.cancelActivate();

        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(() => this.deactivate(), MenuItemComponent.ACTIVATION_DELAY);
        } else {
            // de-activate immediately
            this.deactivate();
        }
    }
}

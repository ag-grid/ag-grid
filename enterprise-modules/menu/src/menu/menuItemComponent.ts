import {
    AgEvent,
    Autowired,
    Component,
    Constants,
    GridOptionsWrapper,
    MenuItemDef,
    PostConstruct,
    RefSelector,
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

export class MenuItemComponent extends Component {
    @Autowired('gridOptionsWrapper') private readonly gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('popupService') private readonly popupService: PopupService;

    @RefSelector('eIcon') private readonly eIcon: HTMLElement;

    public static EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
    public static EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    private static ACTIVE_CLASS = 'ag-menu-option-active';

    private params: MenuItemDef;
    private tooltip: string;
    private hideSubMenu: () => void;
    private subMenuComponent: IComponent<any> | Component;

    constructor(params: MenuItemDef) {
        super(/* html */`
            <div class="ag-menu-option" tabindex="-1" role="listitem">
                <span ref="eIcon" class="ag-menu-option-part ag-menu-option-icon" role="presentation"></span>
                <span ref="eName" class="ag-menu-option-part ag-menu-option-text">${params.name}</span>
            </div>`);

        this.params = params;
    }

    @PostConstruct
    private init() {
        this.addIcon();
        this.addTooltip();;
        this.addShortcut();
        this.addSubMenu();

        if (this.params.disabled) {
            this.addCssClass('ag-menu-option-disabled');
        } else {
            this.addGuiEventListener('click', this.onItemSelected.bind(this));
            this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
                if (e.keyCode === Constants.KEY_ENTER || e.keyCode === Constants.KEY_SPACE) {
                    this.onItemSelected(e);
                }
            });

            this.addGuiEventListener('mouseenter', () => this.activate(true));
            this.addGuiEventListener('mouseleave', e => this.handleMouseLeave(e));
        }

        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(it => _.addCssClass(this.getGui(), it));
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
        let destroySubComponent = () => { };

        if (this.params.subMenu instanceof Array) {
            const childMenu = this.createBean(new MenuList());

            childMenu.setParentComponent(this);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());

            // bubble menu item selected events
            this.addManagedListener(childMenu, MenuItemComponent.EVENT_MENU_ITEM_SELECTED, e => this.dispatchEvent(e));

            destroySubComponent = () => this.destroyBean(childMenu);

            if (activateFirstItem) {
                setTimeout(() => childMenu.activateFirstItem(), 0);
            }

            this.subMenuComponent = childMenu;
        } else {
            ePopup.appendChild(this.params.subMenu.getGui());

            this.subMenuComponent = this.params.subMenu;
        }

        const closePopup = this.popupService.addAsModalPopup(ePopup, false);

        this.hideSubMenu = () => {
            closePopup();
            destroySubComponent();
            this.subMenuComponent = null;
        };

        this.popupService.positionPopupForMenu({ eventSource: this.getGui(), ePopup });
    }

    public closeSubMenu(): void {
        if (this.hideSubMenu) {
            this.hideSubMenu();
            this.hideSubMenu = null;
        }
    }

    public activate(openSubMenu?: boolean): void {
        if (this.params.disabled) { return; }

        this.addCssClass(MenuItemComponent.ACTIVE_CLASS);
        this.getGui().focus();

        if (openSubMenu && this.params.subMenu) {
            window.setTimeout(() => {
                if (this.isAlive() && _.containsClass(this.getGui(), MenuItemComponent.ACTIVE_CLASS)) {
                    this.openSubMenu();
                }
            }, 300);
        }

        this.onItemActivated();
    }

    public deactivate() {
        this.removeCssClass(MenuItemComponent.ACTIVE_CLASS);

        if (this.subMenuComponent) {
            this.hideSubMenu();
        }
    }

    private addIcon(): void {
        if (this.params.checked) {
            this.eIcon.appendChild(_.createIconNoSpan('check', this.gridOptionsWrapper));
        } else if (this.params.icon) {
            if (_.isNodeOrElement(this.params.icon)) {
                this.eIcon.appendChild(this.params.icon as HTMLElement);
            } else if (typeof this.params.icon === 'string') {
                this.eIcon.innerHTML = this.params.icon;
            } else {
                console.warn('ag-Grid: menu item icon must be DOM node or string');
            }
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
        if (this.params.shortcut) {
            const shortcut = _.loadTemplate(/* html */
                `<span ref="eShortcut" class="ag-menu-option-part ag-menu-option-shortcut">${this.params.shortcut}</span>`);

            this.getGui().appendChild(shortcut);
        }
    }

    private addSubMenu(): void {
        if (this.params.subMenu) {
            const pointer = _.loadTemplate(/* html */
                `<span ref="ePopupPointer" class="ag-menu-option-part ag-menu-option-popup-pointer"></span>`);

            const iconName = this.gridOptionsWrapper.isEnableRtl() ? 'smallLeft' : 'smallRight';

            pointer.appendChild(_.createIconNoSpan(iconName, this.gridOptionsWrapper));

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

    private handleMouseLeave(e: MouseEvent): void {
        const subMenuGui = this.subMenuComponent && this.subMenuComponent.getGui();
        const relatedTarget = (e.relatedTarget as HTMLElement);

        if (relatedTarget && subMenuGui && (subMenuGui.contains(relatedTarget))) {
            return;
        }

        this.deactivate();
    }
}

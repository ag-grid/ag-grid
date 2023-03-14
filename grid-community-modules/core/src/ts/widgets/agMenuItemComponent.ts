
import { AgEvent } from '../events';
import { IPopupComponent } from '../interfaces/iPopupComponent';
import { Autowired } from '../context/context';
import { AgMenuList } from './agMenuList';
import { AgMenuPanel } from './agMenuPanel';
import { Component } from './component';
import { PopupService } from './popupService';
import { KeyCode } from '../constants/keyCode';
import { PostConstruct } from '../context/context';
import { MenuItemLeafDef, MenuItemDef } from '../entities/gridOptions';
import { ITooltipParams } from '../rendering/tooltipComponent';
import { createIconNoSpan } from '../utils/icon';
import { isNodeOrElement, loadTemplate } from '../utils/dom';
import { CustomTooltipFeature } from './customTooltipFeature';
import { getAriaLevel, setAriaDisabled, setAriaExpanded } from '../utils/aria';
import { IComponent } from '../interfaces/iComponent';
import { WithoutGridCommon } from '../interfaces/iCommon';

interface MenuItemComponentParams extends MenuItemLeafDef {
    isCompact?: boolean;
    isAnotherSubMenuOpen: () => boolean;
    subMenu?: (MenuItemDef | string)[] | IComponent<any>;
    shouldSetMaxHeight?: boolean;
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

export class AgMenuItemComponent extends Component {
    @Autowired('popupService') private readonly popupService: PopupService;

    public static EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
    public static EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    public static ACTIVATION_DELAY = 80;

    private isActive = false;
    private tooltip: string;
    private hideSubMenu: (() => void) | null;
    private subMenuIsOpen = false;
    private activateTimeoutId: number;
    private deactivateTimeoutId: number;

    constructor(private readonly params: MenuItemComponentParams) {
        super();

        this.setTemplate(/* html */`<div class="${this.getClassName()}" tabindex="-1" role="treeitem"></div>`);
    }

    @PostConstruct
    private init() {
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
        this.addTooltip();

        const eGui = this.getGui();

        if (this.params.disabled) {
            this.addCssClass(this.getClassName('disabled'));
            setAriaDisabled(eGui, true);
        } else {
            this.addGuiEventListener('click', e => this.onItemSelected(e));
            this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                    e.preventDefault();
                    this.onItemSelected(e);
                }
            });
            this.addGuiEventListener('mousedown', e => {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });

            this.addGuiEventListener('mouseenter', () => this.onMouseEnter());
            this.addGuiEventListener('mouseleave', () => this.onMouseLeave());
        }

        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(it => this.addCssClass(it));
        }
    }

    public isDisabled(): boolean {
        return !!this.params.disabled;
    }

    public openSubMenu(activateFirstItem = false): void {
        this.closeSubMenu();

        if (!this.params.subMenu) { return; }

        const ePopup = loadTemplate(/* html */`<div class="ag-menu" role="presentation"></div>`);
        let destroySubMenu: () => void;

        if (this.params.subMenu instanceof Array) {
            const currentLevel = getAriaLevel(this.getGui());
            const nextLevel = isNaN(currentLevel) ? 1 : (currentLevel + 1);
            const childMenu = this.createBean(new AgMenuList(nextLevel));

            childMenu.setParentComponent(this);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());

            // bubble menu item selected events
            this.addManagedListener(childMenu, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, e => this.dispatchEvent(e));
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());

            destroySubMenu = () => this.destroyBean(childMenu);

            if (activateFirstItem) {
                setTimeout(() => childMenu.activateFirstItem(), 0);
            }
        } else {
            const { subMenu } = this.params;

            const menuPanel = this.createBean(new AgMenuPanel(subMenu));
            menuPanel.setParentComponent(this);

            const subMenuGui = menuPanel.getGui();
            const mouseEvent = 'mouseenter';
            const mouseEnterListener = () => this.cancelDeactivate();

            subMenuGui.addEventListener(mouseEvent, mouseEnterListener);

            destroySubMenu = () => subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);

            ePopup.appendChild(subMenuGui);

            if ((subMenu as any).afterGuiAttached) {
                setTimeout(() => (subMenu as any).afterGuiAttached!(), 0);
            }
        }

        const eGui = this.getGui();

        const positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService,
            { eventSource: eGui, ePopup, shouldSetMaxHeight: this.params.shouldSetMaxHeight });

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu')
        });

        this.subMenuIsOpen = true;
        setAriaExpanded(eGui, true);

        this.hideSubMenu = () => {
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            this.subMenuIsOpen = false;
            setAriaExpanded(eGui, false);
            destroySubMenu();
        };
    }

    public closeSubMenu(): void {
        if (!this.hideSubMenu) { return; }
        this.hideSubMenu();
        this.hideSubMenu = null;
        setAriaExpanded(this.getGui(), false);
    }

    public isSubMenuOpen(): boolean {
        return this.subMenuIsOpen;
    }

    public activate(openSubMenu?: boolean): void {
        this.cancelActivate();

        if (this.params.disabled) { return; }

        this.isActive = true;
        this.addCssClass(this.getClassName('active'));
        this.getGui().focus();

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
        this.removeCssClass(this.getClassName('active'));
        this.isActive = false;

        if (this.subMenuIsOpen) {
            this.hideSubMenu!();
        }
    }

    private addIcon(): void {
        if (!this.params.checked && !this.params.icon && this.params.isCompact) { return; }

        const icon = loadTemplate(/* html */
            `<span ref="eIcon" class="${this.getClassName('part')} ${this.getClassName('icon')}" role="presentation"></span>`
        );

        if (this.params.checked) {
            icon.appendChild(createIconNoSpan('check', this.gridOptionsService)!);
        } else if (this.params.icon) {
            if (isNodeOrElement(this.params.icon)) {
                icon.appendChild(this.params.icon as HTMLElement);
            } else if (typeof this.params.icon === 'string') {
                icon.innerHTML = this.params.icon;
            } else {
                console.warn('AG Grid: menu item icon must be DOM node or string');
            }
        }

        this.getGui().appendChild(icon);
    }

    private addName(): void {
        if (!this.params.name && this.params.isCompact) { return; }

        const name = loadTemplate(/* html */
            `<span ref="eName" class="${this.getClassName('part')} ${this.getClassName('text')}">${this.params.name || ''}</span>`
        );

        this.getGui().appendChild(name);
    }

    private addTooltip(): void {
        if (!this.params.tooltip) { return; }

        this.tooltip = this.params.tooltip;

        if (this.gridOptionsService.is('enableBrowserTooltips')) {
            this.getGui().setAttribute('title', this.tooltip);
        } else {
            this.createManagedBean(new CustomTooltipFeature(this));
        }
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        return {
            location: 'menu',
            value: this.tooltip
        };
    }

    private addShortcut(): void {
        if (!this.params.shortcut && this.params.isCompact) { return; }
        const shortcut = loadTemplate(/* html */
            `<span ref="eShortcut" class="${this.getClassName('part')} ${this.getClassName('shortcut')}">${this.params.shortcut || ''}</span>`
        );

        this.getGui().appendChild(shortcut);
    }

    private addSubMenu(): void {
        if (!this.params.subMenu && this.params.isCompact) { return; }

        const pointer = loadTemplate(/* html */
            `<span ref="ePopupPointer" class="${this.getClassName('part')} ${this.getClassName('popup-pointer')}"></span>`
        );

        const eGui = this.getGui();

        if (this.params.subMenu) {
            const iconName = this.gridOptionsService.is('enableRtl') ? 'smallLeft' : 'smallRight';
            setAriaExpanded(eGui, false);

            pointer.appendChild(createIconNoSpan(iconName, this.gridOptionsService)!);
        }

        eGui.appendChild(pointer);
    }

    private onItemSelected(event: MouseEvent | KeyboardEvent): void {
        if (this.params.action) {
            this.params.action();
        } else {
            this.openSubMenu(event && event.type === 'keydown');
        }

        if (this.params.subMenu && !this.params.action) { return; }

        const e: MenuItemSelectedEvent = {
            type: AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED,
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

        if (this.params.isAnotherSubMenuOpen()) {
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

    private getClassName(suffix?: string) {
        const prefix = this.params.isCompact ? 'ag-compact-menu-option' : 'ag-menu-option';

        return suffix ? `${prefix}-${suffix}` : prefix;
    }
}

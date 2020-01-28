import { Autowired, Component, MenuItemDef, PopupService, _, PostConstruct } from "@ag-grid-community/core";
import { MenuItemComponent, MenuItemSelectedEvent } from "./menuItemComponent";

export class MenuList extends Component {

    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE = '<div class="ag-menu-list" tabindex="-1"></div>';

    private static SEPARATOR_TEMPLATE =
        `<div class="ag-menu-separator">
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
        </div>`;

    private static HIDE_MENU_DELAY: number = 80;

    private activeMenuItemParams: MenuItemDef | null;
    private activeMenuItem: MenuItemComponent | null;
    private subMenuHideTimer: number = 0;
    private subMenuShowTimer: number = 0;

    private removeChildFuncs: Function[] = [];
    private subMenuParentComp: MenuItemComponent | null;
    private subMenuComp: MenuList | null;

    constructor() {
        super(MenuList.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        const eGui = this.getGui();
        window.setTimeout(() => {
            if (eGui && this.isAlive() && !this.getParentComponent()) {
                eGui.focus();
            }
        }, 0);

        this.addDestroyableEventListener(eGui, 'keydown', this.onItemNav.bind(this));
    }

    public clearActiveItem(): void {
        this.deactivateItem();
        this.removeChildPopup();
    }

    public addMenuItems(menuItems: (MenuItemDef | string)[] | undefined): void {
        if (!menuItems || _.missing(menuItems)) {
            return;
        }
        menuItems.forEach((menuItemOrString: MenuItemDef | string) => {
            if (menuItemOrString === 'separator') {
                this.addSeparator();
            } else if (typeof menuItemOrString === 'string') {
                console.warn(`ag-Grid: unrecognised menu item ` + menuItemOrString);
            } else {
                const menuItem = menuItemOrString as MenuItemDef;
                this.addItem(menuItem);
            }
        });
    }

    public addItem(menuItemDef: MenuItemDef): void {
        const cMenuItem = new MenuItemComponent(menuItemDef);
        this.getContext().wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());

        this.addDestroyFunc(() => cMenuItem.destroy());

        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, (event: MenuItemSelectedEvent) => {
            if (menuItemDef.subMenu && !menuItemDef.action) {
                this.showChildMenu(cMenuItem, menuItemDef, event.mouseEvent);
            } else {
                this.dispatchEvent(event);
            }
        });

        const handleMouseEnter = (cMenuItem: MenuItemComponent, menuItemDef: MenuItemDef) => {
            if (this.subMenuShowTimer) {
                window.clearTimeout(this.subMenuShowTimer);
                this.subMenuShowTimer = 0;
            }

            if (!this.subMenuHideTimer) {
                this.mouseEnterItem(cMenuItem, menuItemDef)
            } else {
                this.subMenuShowTimer = window.setTimeout(() => {
                    handleMouseEnter(cMenuItem, menuItemDef)
                }, MenuList.HIDE_MENU_DELAY);
            }
        }

        const handleMouseLeave = (e: MouseEvent, cMenuItem: MenuItemComponent) => {
            if (this.subMenuParentComp === cMenuItem) {
                if (this.subMenuHideTimer) { return; }

                this.subMenuHideTimer = window.setTimeout(
                    () => this.mouseLeaveItem(e, cMenuItem),
                    MenuList.HIDE_MENU_DELAY
                );
            } else if (!this.subMenuHideTimer) {
                this.mouseLeaveItem(e, cMenuItem);
            }
        }

        cMenuItem.addGuiEventListener('mouseenter', () => handleMouseEnter(cMenuItem, menuItemDef));
        cMenuItem.addGuiEventListener('mouseleave', (e) => handleMouseLeave(e, cMenuItem));
    }

    private mouseEnterItem(menuItem: MenuItemComponent, menuItemParams: MenuItemDef): void {
        this.subMenuShowTimer = 0;
        this.activateItem(menuItem, menuItemParams);
    }

    private mouseLeaveItem(e: MouseEvent, menuItem: MenuItemComponent) {
        const isParent = this.subMenuComp && this.subMenuComp.getParentComponent() === menuItem;
        const subMenuGui = isParent && this.subMenuComp.getGui();
        const relatedTarget = (e.relatedTarget as HTMLElement);

        this.subMenuHideTimer = 0;

        if (
            relatedTarget && subMenuGui &&
            (subMenuGui.contains(relatedTarget) || relatedTarget.contains(subMenuGui))
        ) { return; }

        this.deactivateItem(menuItem);
    }

    private activateItem(menuItem: MenuItemComponent, menuItemParams: MenuItemDef, ): void {
        if (menuItemParams.disabled) {
            return;
        }

        if (this.activeMenuItemParams !== menuItemParams) {
            this.removeChildPopup();
        }

        if (this.activeMenuItem && this.activeMenuItem !== menuItem) {
            this.deactivateItem();
        }

        this.activeMenuItemParams = menuItemParams;
        this.activeMenuItem = menuItem;
        _.addCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');

        if (menuItemParams.subMenu) {
            this.addHoverForChildPopup(menuItem, menuItemParams);
        }
    }

    private deactivateItem(menuItem?: MenuItemComponent) {
        if (!menuItem && this.activateItem) {
            menuItem = this.activeMenuItem;
        }

        if (!menuItem) { return; }

        _.removeCssClass(menuItem.getGui(), 'ag-menu-option-active');

        if (this.subMenuParentComp === menuItem) {
            this.removeChildPopup();
        }

        this.activeMenuItem = null;
        this.activeMenuItemParams = null;
    }

    private onItemNav(e: KeyboardEvent): void {

    }

    private addHoverForChildPopup(menuItemComp: MenuItemComponent, menuItemDef: MenuItemDef): void {
        window.setTimeout(() => {
            const showingThisMenu = this.subMenuParentComp === menuItemComp;
            const menuItemIsActive = this.activeMenuItem === menuItemComp;
            if (this.isAlive() && menuItemIsActive && !showingThisMenu) {
                this.showChildMenu(menuItemComp, menuItemDef, null);
            }
        }, 300);
    }

    public addSeparator(): void {
        this.getGui().appendChild(_.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
    }

    private showChildMenu(menuItemComp: MenuItemComponent, menuItemDef: MenuItemDef, mouseEvent: MouseEvent | null): void {
        this.removeChildPopup();

        const childMenu = new MenuList();
        childMenu.setParentComponent(menuItemComp);

        this.getContext().wireBean(childMenu);
        childMenu.addMenuItems(menuItemDef.subMenu);

        const ePopup = _.loadTemplate('<div class="ag-menu" tabindex="-1"></div>');
        ePopup.appendChild(childMenu.getGui());

        const hidePopupFunc = this.popupService.addAsModalPopup(
            ePopup,
            true,
            undefined,
            mouseEvent
        );

        this.popupService.positionPopupForMenu({
            eventSource: menuItemComp.getGui(),
            ePopup: ePopup
        });

        this.subMenuParentComp = menuItemComp;
        this.subMenuComp = childMenu;

        childMenu.addDestroyableEventListener(ePopup, 'mouseover', () => {
            if (this.subMenuHideTimer && menuItemComp === this.subMenuParentComp) {
                window.clearTimeout(this.subMenuHideTimer);
                window.clearTimeout(this.subMenuShowTimer);
                this.subMenuHideTimer = 0;
                this.subMenuShowTimer = 0;
            }
        });

        const selectedListener = (event: MenuItemSelectedEvent) => {
            this.dispatchEvent(event);
        };
        childMenu.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);

        this.removeChildFuncs.push(() => {
            childMenu.clearActiveItem();
            childMenu.destroy();
            this.subMenuParentComp = null;
            this.subMenuComp = null;
            
            childMenu.removeEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);
            hidePopupFunc();
        });
    }

    private removeChildPopup(): void {
        this.removeChildFuncs.forEach(func => func());
        this.removeChildFuncs = [];
    }

    public destroy(): void {
        this.removeChildPopup();
        super.destroy();
    }
}

import { Autowired, Component, MenuItemDef, PopupService, _, PostConstruct, Constants, GridOptionsWrapper } from "@ag-grid-community/core";
import { MenuItemComponent, MenuItemSelectedEvent } from "./menuItemComponent";

type MenuItem = { comp: MenuItemComponent, params: MenuItemDef };

export class MenuList extends Component {

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE = '<div class="ag-menu-list" tabindex="-1"></div>';

    private static SEPARATOR_TEMPLATE =
        `<div class="ag-menu-separator">
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
        </div>`;

    private static HIDE_MENU_DELAY: number = 80;

    
    private menuItems: MenuItem[] = [];
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

        this.addDestroyableEventListener(eGui, 'keydown', this.handleKeyDown.bind(this));
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
        this.menuItems.push({comp: cMenuItem, params: menuItemDef });
        this.getGui().appendChild(cMenuItem.getGui());

        this.addDestroyFunc(() => cMenuItem.destroy());

        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, (event: MenuItemSelectedEvent) => {
            if (menuItemDef.subMenu && !menuItemDef.action) {
                this.showChildMenu(cMenuItem, menuItemDef, event.mouseEvent);
            } else {
                this.dispatchEvent(event);
            }
        });

        cMenuItem.setParentComponent(this);

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

    public activateFirstItem(): void {
        const item = this.menuItems.filter(item => !item.params.disabled)[0];
        if (!item) { return; }
        this.activateItem(item.comp, item.params);
    }

    private mouseEnterItem(menuItem: MenuItemComponent, menuItemParams: MenuItemDef): void {
        this.subMenuShowTimer = 0;
        this.activateItem(menuItem, menuItemParams, true);
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

    private activateItem(menuItem: MenuItemComponent, menuItemParams: MenuItemDef, openSubMenu?: boolean): void {
        if (menuItemParams.disabled) {
            this.deactivateItem();
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
        const eGui = menuItem.getGui();
        _.addCssClass(eGui, 'ag-menu-option-active');

        eGui.focus();

        if (openSubMenu && menuItemParams.subMenu) {
            this.addHoverForChildPopup(menuItem, menuItemParams);
        }
    }

    private deactivateItem(menuItem?: MenuItemComponent) {
        if (!menuItem && this.activeMenuItem) {
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

    private handleKeyDown(e: KeyboardEvent): void {
        const navKeys = [
            Constants.KEY_UP,
            Constants.KEY_RIGHT,
            Constants.KEY_DOWN,
            Constants.KEY_LEFT
        ];

        if (navKeys.indexOf(e.keyCode) !== -1) {
            e.preventDefault();
            this.handleNavKey(e.keyCode);
        }

        if (e.keyCode === Constants.KEY_ESCAPE) {
            let parent = this.getParentComponent();
            while (true) {
                const nextParent = parent && parent.getParentComponent && parent.getParentComponent();
                if (!nextParent || (!(nextParent instanceof MenuList || nextParent instanceof MenuItemComponent))) {
                    break;
                }
                parent = nextParent;
            }
            if (parent) {
                parent.getGui().focus();
            }
        }
    }

    private handleNavKey(key: number): void {
        if (key === Constants.KEY_UP || key === Constants.KEY_DOWN) {
            const nextItem = this.findNextItem(key === Constants.KEY_UP);
            if (nextItem && nextItem.comp !== this.activeMenuItem) {
                this.deactivateItem();
                this.activateItem(nextItem.comp, nextItem.params);
            }
            return;
        }

        if (!this.activateItem) { return; }

        const left = this.gridOptionsWrapper.isEnableRtl() ? Constants.KEY_RIGHT : Constants.KEY_LEFT;

        if (key === left) {
            this.closeIfIsChild();
        } else {
            this.openChild();
        }
    }

    private closeIfIsChild(): void {
        const parentItem = this.getParentComponent();
        if (parentItem && parentItem instanceof MenuItemComponent) {
            const parentMenuList = parentItem.getParentComponent() as MenuList;
            parentItem.getGui().focus();
            parentMenuList.removeChildPopup();
        }
    }

    private openChild(): void {
        if (this.activeMenuItemParams && this.activeMenuItemParams.subMenu) {
            this.showChildMenu(this.activeMenuItem, this.activeMenuItemParams, null);
            setTimeout(() => {
                const subMenu = this.subMenuComp;
                subMenu.activateFirstItem();
            }, 0)
        }
    }

    private findNextItem(up?: boolean): MenuItem | undefined {
        const items = this.menuItems.filter(item => !item.params.disabled);
        if (!items.length) { return; }
        if (!this.activeMenuItem) {
            return up ? _.last(items) : items[0];
        }

        if (up) {
            items.reverse();
        }

        let nextItem: MenuItem;
        let foundCurrent = false;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!foundCurrent) {
                if (item.comp === this.activeMenuItem) {
                    foundCurrent = true;
                }
                continue;
            }
            nextItem = item;
            break;
        }

        return nextItem || { comp: this.activeMenuItem, params: this.activeMenuItemParams };
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
            false,
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

    public removeChildPopup(): void {
        this.removeChildFuncs.forEach(func => func());
        this.removeChildFuncs = [];
    }

    public destroy(): void {
        this.removeChildPopup();
        super.destroy();
    }
}

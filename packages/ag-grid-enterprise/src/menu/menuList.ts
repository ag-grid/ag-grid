import { Autowired, Component, MenuItemDef, PopupService, _ } from "ag-grid-community";
import { MenuItemComponent, MenuItemSelectedEvent } from "./menuItemComponent";

export class MenuList extends Component {

    @Autowired('popupService') private popupService: PopupService;

    // private instance = Math.random();

    private static TEMPLATE = '<div class="ag-menu-list"></div>';

    private static SEPARATOR_TEMPLATE =
        `<div class="ag-menu-separator">
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
            <span class="ag-menu-separator-cell"></span>
        </div>`;

    private activeMenuItemParams: MenuItemDef | null;
    private activeMenuItem: MenuItemComponent | null;
    private timerCount = 0;

    private removeChildFuncs: Function[] = [];
    private subMenuParentDef: MenuItemDef | null;

    constructor() {
        super(MenuList.TEMPLATE);
    }

    public clearActiveItem(): void {
        this.removeActiveItem();
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
                this.showChildMenu(menuItemDef, cMenuItem, event.mouseEvent);
            } else {
                this.dispatchEvent(event);
            }
        });

        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, menuItemDef, cMenuItem));
        cMenuItem.addGuiEventListener('mouseleave', () => this.timerCount++);
    }

    private mouseEnterItem(menuItemParams: MenuItemDef, menuItem: MenuItemComponent): void {
        if (menuItemParams.disabled) {
            return;
        }

        if (this.activeMenuItemParams !== menuItemParams) {
            this.removeChildPopup();
        }

        this.removeActiveItem();

        this.activeMenuItemParams = menuItemParams;
        this.activeMenuItem = menuItem;
        _.addCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');

        if (menuItemParams.subMenu) {
            this.addHoverForChildPopup(menuItemParams, menuItem);
        }
    }

    private removeActiveItem(): void {
        if (this.activeMenuItem) {
            _.removeCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');
            this.activeMenuItem = null;
            this.activeMenuItemParams = null;
        }
    }

    private addHoverForChildPopup(menuItemDef: MenuItemDef, menuItemComp: MenuItemComponent): void {
        const timerCountCopy = this.timerCount;
        window.setTimeout(() => {
            const shouldShow = timerCountCopy === this.timerCount;
            const showingThisMenu = this.subMenuParentDef === menuItemDef;
            if (shouldShow && !showingThisMenu) {
                this.showChildMenu(menuItemDef, menuItemComp, null);
            }
        }, 300);
    }

    public addSeparator(): void {
        this.getGui().appendChild(_.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
    }

    private showChildMenu(menuItemDef: MenuItemDef, menuItemComp: MenuItemComponent, mouseEvent: MouseEvent | null): void {
        this.removeChildPopup();

        const childMenu = new MenuList();
        this.getContext().wireBean(childMenu);
        childMenu.addMenuItems(menuItemDef.subMenu);

        const ePopup = _.loadTemplate('<div class="ag-menu"></div>');
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

        this.subMenuParentDef = menuItemDef;

        const selectedListener = (event: MenuItemSelectedEvent) => {
            this.dispatchEvent(event);
        };
        childMenu.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);

        this.removeChildFuncs.push(() => {
            childMenu.clearActiveItem();
            childMenu.destroy();
            this.subMenuParentDef = null;
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

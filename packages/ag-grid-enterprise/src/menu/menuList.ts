import {Utils as _, PopupService, MenuItemDef, Component, Autowired, Context} from "ag-grid";
import {MenuItemComponent, MenuItemSelectedEvent} from "./menuItemComponent";

export class MenuList extends Component {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    // private instance = Math.random();

    private static TEMPLATE =
        '<div class="ag-menu-list"></div>';

    private static SEPARATOR_TEMPLATE =
        '<div class="ag-menu-separator">' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '</div>';

    private activeMenuItemParams: MenuItemDef;
    private activeMenuItem: MenuItemComponent;
    private timerCount = 0;

    private removeChildFuncs: Function[] = [];
    private subMenuParentDef: MenuItemDef;

    constructor() {
        super(MenuList.TEMPLATE);
        // console.log('MenuList->constructor() ' + this.instance);
    }

    public clearActiveItem(): void {
        this.removeActiveItem();
        this.removeChildPopup();
    }

    public addMenuItems(menuItems: (MenuItemDef|string)[]): void {
        if (_.missing(menuItems)) { return; }
        menuItems.forEach( (menuItemOrString: MenuItemDef|string)=> {
            if (menuItemOrString === 'separator') {
                this.addSeparator();
            } else if (typeof menuItemOrString === 'string') {
                console.log(`ag-Grid: unrecognised menu item ` + menuItemOrString);
            } else {
                let menuItem = <MenuItemDef> menuItemOrString;
                this.addItem(menuItem);
            }
        });
    }

    public addItem(menuItemDef: MenuItemDef): void {
        let cMenuItem = new MenuItemComponent(menuItemDef);
        this.context.wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());

        this.addDestroyFunc( ()=> cMenuItem.destroy() );

        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, (event: MenuItemSelectedEvent) => {
            if (menuItemDef.subMenu) {
                this.showChildMenu(menuItemDef, cMenuItem, event.mouseEvent);
            } else {
                this.dispatchEvent(event)
            }
        });

        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, menuItemDef, cMenuItem));
        cMenuItem.addGuiEventListener('mouseleave', ()=> this.timerCount++ );
    }

    private mouseEnterItem(menuItemParams: MenuItemDef, menuItem: MenuItemComponent): void {
        if (menuItemParams.disabled) {
            return;
        }

        if (this.activeMenuItemParams!==menuItemParams) {
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
        let timerCountCopy = this.timerCount;
        setTimeout( ()=> {
            let shouldShow = timerCountCopy===this.timerCount;
            let showingThisMenu = this.subMenuParentDef === menuItemDef;
            if (shouldShow && !showingThisMenu) {
                this.showChildMenu(menuItemDef, menuItemComp, null);
            }
        }, 500);
    }

    public addSeparator(): void {
        this.getGui().appendChild(_.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
    }

    private showChildMenu(menuItemDef: MenuItemDef, menuItemComp: MenuItemComponent, mouseEvent: MouseEvent): void {
        this.removeChildPopup();

        let childMenu = new MenuList();
        this.context.wireBean(childMenu);
        childMenu.addMenuItems(menuItemDef.subMenu);

        let ePopup = _.loadTemplate('<div class="ag-menu"></div>');
        ePopup.appendChild(childMenu.getGui());

        let hidePopupFunc = this.popupService.addAsModalPopup(
            ePopup,
            true,
            null,
            mouseEvent
        );

        this.popupService.positionPopupForMenu({
            eventSource: menuItemComp.getGui(),
            ePopup: ePopup
        });

        this.subMenuParentDef = menuItemDef;

        let selectedListener = (event: MenuItemSelectedEvent)=> {
            this.dispatchEvent(event)
        };
        childMenu.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);

        this.removeChildFuncs.push( ()=> {
            childMenu.clearActiveItem();
            childMenu.destroy();
            this.subMenuParentDef = null;
            childMenu.removeEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);
            hidePopupFunc();
        });
    }

    private removeChildPopup(): void {
        this.removeChildFuncs.forEach( func => func() );
        this.removeChildFuncs = [];
    }

    public destroy(): void {
        // console.log('MenuList->destroy() ' + this.instance);
        this.removeChildPopup();
        super.destroy();
    }
}

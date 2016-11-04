
import {Component} from "./component";
import {Autowired, Context} from "../context/context";
import {Utils as _} from "../utils";
import {PopupService} from "./popupService";
import {MenuItem, MenuItemComponent} from "./menuItemComponent";

export class MenuList extends Component {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<div class="ag-menu-list"></div>';

    private static SEPARATOR_TEMPLATE =
        '<div class="ag-menu-separator">' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '  <span class="ag-menu-separator-cell"></span>' +
        '</div>';

    private activeMenuItemParams: MenuItem;
    private activeMenuItem: MenuItemComponent;
    private timerCount = 0;

    private showingChildMenu: MenuList;
    private childPopupRemoveFunc: Function;

    constructor() {
        super(MenuList.TEMPLATE);
    }

    public clearActiveItem(): void {
        this.removeActiveItem();
        this.removeOldChildPopup();
    }

    public addMenuItems(menuItems: (string|MenuItem)[], defaultMenuItems: {[key: string]: MenuItem}): void {
        if (_.missing(menuItems)) { return; }
        menuItems.forEach( (listItem: MenuItem|string)=> {
            if (listItem === 'separator') {
                this.addSeparator();
            } else {
                var menuItem: MenuItem;
                if (typeof listItem === 'string') {
                    menuItem = defaultMenuItems[<string>listItem];
                } else {
                    menuItem = <MenuItem> listItem;
                }
                this.addItem(menuItem);
            }
        });
    }

    public addItem(params: MenuItem): void {
        var cMenuItem = new MenuItemComponent(params);
        this.context.wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());

        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, (event: any) => {
            if (params.childMenu) {
                this.showChildMenu(params, cMenuItem);
            } else {
                this.dispatchEvent(MenuItemComponent.EVENT_ITEM_SELECTED, event)
            }
        });

        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, params, cMenuItem));
        cMenuItem.addGuiEventListener('mouseleave', ()=> this.timerCount++ );

        if (params.childMenu) {
            this.addDestroyFunc( ()=> params.childMenu.destroy() );
        }
    }

    private mouseEnterItem(menuItemParams: MenuItem, menuItem: MenuItemComponent): void {
        if (menuItemParams.disabled) {
            return;
        }

        if (this.activeMenuItemParams!==menuItemParams) {
            this.removeOldChildPopup();
        }

        this.removeActiveItem();

        this.activeMenuItemParams = menuItemParams;
        this.activeMenuItem = menuItem;
        _.addCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');

        if (menuItemParams.childMenu) {
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

    private addHoverForChildPopup(menuItemParams: MenuItem, menuItem: MenuItemComponent): void {
        var timerCountCopy = this.timerCount;
        setTimeout( ()=> {
            var shouldShow = timerCountCopy===this.timerCount;
            var showingThisMenu = this.showingChildMenu === menuItemParams.childMenu;
            if (shouldShow && !showingThisMenu) {
                this.showChildMenu(menuItemParams, menuItem);
            }
        }, 500);
    }

    private showChildMenu(menuItemParams: MenuItem, menuItem: MenuItemComponent): void {
        this.removeOldChildPopup();

        var ePopup = _.loadTemplate('<div class="ag-menu"></div>');
        ePopup.appendChild(menuItemParams.childMenu.getGui());

        this.childPopupRemoveFunc = this.popupService.addAsModalPopup(
            ePopup,
            true
        );
        this.popupService.positionPopupForMenu({
            eventSource: menuItem.getGui(),
            ePopup: ePopup
        });

        this.showingChildMenu = menuItemParams.childMenu;
    }

    public addSeparator(): void {
        this.getGui().appendChild(_.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
    }

    private removeOldChildPopup(): void {
        if (this.childPopupRemoveFunc) {
            this.showingChildMenu.clearActiveItem();
            this.childPopupRemoveFunc();
            this.childPopupRemoveFunc = null;
            this.showingChildMenu = null;
        }
    }

    public destroy(): void {
        this.removeOldChildPopup();
        super.destroy();
    }
}

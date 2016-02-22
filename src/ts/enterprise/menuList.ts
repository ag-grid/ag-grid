
import {Component} from "../widgets/component";
import {PostConstruct} from "../context/context";
import {MenuItem} from "./menuItem";
import {MenuItemParams} from "./menuItem";
import _ from '../utils';
import EventService from "../eventService";
import {Autowired} from "../context/context";
import {Context} from "../context/context";
import PopupService from "../widgets/agPopupService";

export class MenuList extends Component {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<div class="ag-menu-list"></div>';

    private activeMenuItemParams: MenuItemParams;
    private activeMenuItem: MenuItem;
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

    public addItem(params: MenuItemParams): void {
        var cMenuItem = new MenuItem(params);
        this.context.wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());

        cMenuItem.addEventListener(MenuItem.EVENT_ITEM_SELECTED, (event: any) => {
            if (params.childMenu) {
                this.showChildMenu(params, cMenuItem);
            } else {
                this.dispatchEvent(MenuItem.EVENT_ITEM_SELECTED, event)
            }
        });

        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, params, cMenuItem));
        cMenuItem.addGuiEventListener('mouseleave', ()=> this.timerCount++ );

        if (params.childMenu) {
            this.addDestroyFunc( ()=> params.childMenu.destroy() );
        }
    }

    private mouseEnterItem(menuItemParams: MenuItemParams, menuItem: MenuItem): void {
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

    private addHoverForChildPopup(menuItemParams: MenuItemParams, menuItem: MenuItem): void {
        var timerCountCopy = this.timerCount;
        setTimeout( ()=> {
            var shouldShow = timerCountCopy===this.timerCount;
            var showingThisMenu = this.showingChildMenu === menuItemParams.childMenu;
            if (shouldShow && !showingThisMenu) {
                this.showChildMenu(menuItemParams, menuItem);
            }
        }, 500);
    }

    private showChildMenu(menuItemParams: MenuItemParams, menuItem: MenuItem): void {
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
        this.getGui().appendChild(_.loadTemplate('<div class="ag-menu-separator"></div>'))
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

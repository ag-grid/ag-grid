import {
    GetContextMenuItemsParams,
    GetContextMenuItems,
    Bean,
    EventService,
    IContextMenuFactory,
    Autowired,
    Context,
    PopupService,
    PostConstruct,
    Component,
    GridOptionsWrapper,
    RowNode,
    Utils,
    Column,
    MenuItemDef,
    GridApi
} from "ag-grid";
import {ClipboardService} from "../clipboardService";
import {MenuItemComponent} from "./menuItemComponent";
import {MenuList} from "./menuList";
import {MenuItemMapper} from "./menuItemMapper";

@Bean('contextMenuFactory')
export class ContextMenuFactory implements IContextMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    private init(): void {
    }

    private getMenuItems(node: RowNode, column: Column, value: any): (MenuItemDef|string)[] {
        var defaultMenuOptions: string[];
        if (Utils.exists(node)) {
            // if user clicks a cell
            defaultMenuOptions = ['copy','copyWithHeaders','paste','separator','toolPanel'];
        } else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            defaultMenuOptions = ['toolPanel'];
        }
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            var userFunc: GetContextMenuItems = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params: GetContextMenuItemsParams = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            var menuItemsFromUser = userFunc(params);
            return menuItemsFromUser;
        } else {
            return defaultMenuOptions;
        }
    }

    public showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent): void {

        var menuItems = this.getMenuItems(node, column, value);

        if (Utils.missingOrEmpty(menuItems)) { return; }

        var menu = new ContextMenu(menuItems);
        this.context.wireBean(menu);

        var eMenuGui =  menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            ()=> menu.destroy()
        );

        this.popupService.positionPopupUnderMouseEvent({
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });

        menu.afterGuiAttached(hidePopup);
    }

}

class ContextMenu extends Component {

    @Autowired('context') private context: Context;
    @Autowired('clipboardService') private clipboardService: ClipboardService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;

    private menuList: MenuList;
    private hidePopupFunc: Function;

    private menuItems: (MenuItemDef|string)[];

    constructor(menuItems: (MenuItemDef|string)[]) {
        super('<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }

    @PostConstruct
    private addMenuItems(): void {

        this.menuList = new MenuList();
        this.context.wireBean(this.menuList);

        let menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);

        this.menuList.addMenuItems(menuItemsMapped);
        this.getGui().appendChild(this.menuList.getGui());

        this.menuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(hidePopup: (event?: any)=>void): void {
        this.hidePopupFunc = hidePopup;
        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', hidePopup);
    }
}
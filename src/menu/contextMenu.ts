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
    GridApi,
    IRowModel,
    IComponent,
    IAfterGuiAttachedParams
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
    @Autowired('rowModel') private rowModel: IRowModel;

    @PostConstruct
    private init(): void {
    }

    private getMenuItems(node: RowNode, column: Column, value: any): (MenuItemDef|string)[] {
        let defaultMenuOptions: string[];
        if (Utils.exists(node)) {
            // if user clicks a cell
            let anyExport:boolean = !this.gridOptionsWrapper.isSuppressExcelExport() || !this.gridOptionsWrapper.isSuppressCsvExport();
            defaultMenuOptions = ['copy','copyWithHeaders','paste','separator','toolPanel'];
            if (anyExport){
                defaultMenuOptions.push('export')
            }
        } else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            defaultMenuOptions = ['toolPanel'];
        }
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            let userFunc: GetContextMenuItems = this.gridOptionsWrapper.getContextMenuItemsFunc();
            let params: GetContextMenuItemsParams = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            let menuItemsFromUser = userFunc(params);
            return menuItemsFromUser;
        } else {
            return defaultMenuOptions;
        }
    }

    public showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent): void {

        let menuItems = this.getMenuItems(node, column, value);

        if (Utils.missingOrEmpty(menuItems)) { return; }

        let menu = new ContextMenu(menuItems);
        this.context.wireBean(menu);

        let eMenuGui =  menu.getHtmlElement();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        let hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            ()=> menu.destroy()
        );

        this.popupService.positionPopupUnderMouseEvent({
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });

        menu.afterGuiAttached({
            eComponent: eMenuGui,
            hidePopupCallback: hidePopup
        });
    }

}

export interface IContextMenuAfterGuiAttachedParams extends IAfterGuiAttachedParams {
    hidePopupCallback: (event?: any)=>void;
}

class ContextMenu extends Component implements IComponent<any, IContextMenuAfterGuiAttachedParams>{

    @Autowired('context') private context: Context;
    @Autowired('clipboardService') private clipboardService: ClipboardService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;

    private menuItems: (MenuItemDef|string)[];

    constructor(menuItems: (MenuItemDef|string)[]) {
        super('<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }

    @PostConstruct
    private addMenuItems(): void {

        let menuList = new MenuList();
        this.context.wireBean(menuList);

        let menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);

        menuList.addMenuItems(menuItemsMapped);

        this.appendChild(menuList);

        menuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.destroy.bind(this));
    }

    public afterGuiAttached(params: IContextMenuAfterGuiAttachedParams): void {

        this.addDestroyFunc(params.hidePopupCallback);

        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', this.destroy.bind(this));
    }
}
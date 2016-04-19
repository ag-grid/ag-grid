import {
    GetContextMenuItemsParams,
    GetContextMenuItems,
    SvgFactory,
    MenuItemComponent,
    Bean,
    IContextMenuFactory,
    Autowired,
    Context,
    PopupService,
    PostConstruct,
    Component,
    MenuList,
    GridOptionsWrapper,
    RowNode,
    Column,
    MenuItem,
    GridApi
} from "ag-grid/main";
import {ClipboardService} from "./clipboardService";

var svgFactory = SvgFactory.getInstance();

@Bean('contextMenuFactory')
export class ContextMenuFactory implements IContextMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    private init(): void {
    }

    private getMenuItems(node: RowNode, column: Column, value: any): [MenuItem|string] {
        var defaultMenuOptions: [string] = ['copy','paste','separator','toolPanel'];
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

    private menuList: MenuList;
    private hidePopupFunc: Function;

    private menuItems: [MenuItem|string];

    constructor(menuItems: [MenuItem|string]) {
        super('<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }

    private createDefaultMenuItems(): {[key: string]: MenuItem} {

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        var result: {[key: string]: MenuItem} = {
            copy: {
                name: localeTextFunc('copy','Copy'),
                shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                icon: svgFactory.createCopyIcon(),
                action: ()=> this.clipboardService.copyToClipboard()
            },
            paste: {
                name: localeTextFunc('paste','Paste'),
                shortcut: localeTextFunc('ctrlV','Ctrl+V'),
                disabled: true,
                icon: svgFactory.createPasteIcon(),
                action: ()=> this.clipboardService.pasteFromClipboard()
            },
            toolPanel: {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: ()=> this.gridApi.showToolPanel(!this.gridApi.isToolPanelShowing())
            }
        };

        return result;
    }

    @PostConstruct
    private addMenuItems(): void {

        this.menuList = new MenuList();
        this.context.wireBean(this.menuList);

        var defaultMenuItems = this.createDefaultMenuItems();
        this.menuList.addMenuItems(this.menuItems, defaultMenuItems);
        this.getGui().appendChild(this.menuList.getGui());

        this.menuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(hidePopup: Function): void {
        this.hidePopupFunc = hidePopup;
    }
}
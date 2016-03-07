import {Utils as _} from "ag-grid/main";
import {SvgFactory} from "ag-grid/main";
import {Bean} from "ag-grid/main";
import {IContextMenuFactory} from "ag-grid/main";
import {Autowired} from "ag-grid/main";
import {Context} from "ag-grid/main";
import {PopupService} from "ag-grid/main";
import {PostConstruct} from "ag-grid/main";
import {Component} from "ag-grid/main";
import {ClipboardService} from "./clipboardService";
import {MenuList} from "ag-grid/main";
import {CMenuItem} from "ag-grid/main";
import {GridOptionsWrapper} from "ag-grid/main";
import {RowNode} from "ag-grid/main";
import {Column} from "ag-grid/main";
import {MenuItem} from "ag-grid/main";
import {GridApi} from "ag-grid/main";

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
            var userFunc = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params = {
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

        var menu = new CContextMenu(menuItems);
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

class CContextMenu extends Component {

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

        this.menuList.addEventListener(CMenuItem.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(hidePopup: Function): void {
        this.hidePopupFunc = hidePopup;
    }
}
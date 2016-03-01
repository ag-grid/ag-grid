import {Bean} from "../context/context";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import Column from "../entities/column";
import {PostConstruct} from "../context/context";
import {Autowired} from "../context/context";
import {Events} from "../events";
import {Component} from "../widgets/component";
import {MenuList} from "../widgets/menuList";
import {Context} from "../context/context";
import SvgFactory from "../svgFactory";
import PopupService from "../widgets/agPopupService";
import {ClipboardService} from "./clipboardService";
import GridOptionsWrapper from "../gridOptionsWrapper";
import _ from '../utils';
import {CMenuItem} from "../widgets/cMenuItem";
import {MenuItem} from "../widgets/cMenuItem";
import {RowNode} from "../entities/rowNode";
import {GetContextMenuItemsParams} from "../entities/gridOptions";

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
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            var userFunc = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params = {
                node: node,
                column: column,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            var menuItemsFromUser = userFunc(params);
            return menuItemsFromUser;
        } else {
            return ['copy','paste'];
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

    private menuList: MenuList;
    private hidePopupFunc: Function;

    private menuItems: [MenuItem|string];

    private defaultMenuItems: {[key: string]: MenuItem} = {
        copy: {
            name: 'Copy',
            shortcut: 'Ctrl+C',
            icon: svgFactory.createCopyIcon(),
            action: ()=> this.clipboardService.copyToClipboard()
        },
        paste: {
            name: 'Paste',
            shortcut: 'Ctrl+V',
            disabled: true,
            icon: svgFactory.createPasteIcon(),
            action: ()=> this.clipboardService.pasteFromClipboard()
        }
    };

    constructor(menuItems: [MenuItem|string]) {
        super('<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }

    @PostConstruct
    private addMenuItems(): void {

        this.menuList = new MenuList();
        this.context.wireBean(this.menuList);

        this.menuList.addMenuItems(this.menuItems, this.defaultMenuItems);
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
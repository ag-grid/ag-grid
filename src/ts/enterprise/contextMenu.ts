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
import {MenuItem} from "../widgets/menuItem";

var svgFactory = SvgFactory.getInstance();

@Bean('contextMenuFactory')
export class ContextMenuFactory implements IContextMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    @PostConstruct
    private init(): void {
    }

    public showMenu(rowIndex: number, column: Column, mouseEvent: MouseEvent): void {

        var menu = new ContextMenu();
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

    private menuList: MenuList;
    private hidePopupFunc: Function;

    constructor() {
        super('<div class="ag-menu"></div>');
    }

    @PostConstruct
    private addMenuItems(): void {

        this.menuList = new MenuList();
        this.context.wireBean(this.menuList);

        this.menuList.addItem({
            name: 'Copy',
            shortcut: 'Ctrl+C',
            icon: svgFactory.createCopyIcon(),
            action: ()=> this.clipboardService.copyToClipboard()
        });
        this.menuList.addItem({
            name: 'Paste',
            shortcut: 'Ctrl+V',
            disabled: true,
            icon: svgFactory.createPasteIcon(),
            action: ()=> this.clipboardService.pasteFromClipboard()
        });

        this.getGui().appendChild(this.menuList.getGui());

        this.menuList.addEventListener(MenuItem.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(hidePopup: Function): void {
        this.hidePopupFunc = hidePopup;
    }
}
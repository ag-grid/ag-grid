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
        this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            ()=> menu.destroy()
        );

        this.popupService.positionPopupUnderMouseEvent({
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });
    }

}

class ContextMenu extends Component {

    @Autowired('context') private context: Context;

    private menuList: MenuList;

    constructor() {
        super('<div class="ag-menu"></div>');
    }

    @PostConstruct
    private addMenuItems(): void {

        this.menuList = new MenuList();
        this.context.wireBean(this.menuList);

        this.menuList.addItem({
            name: 'Cut',
            icon: svgFactory.createCutIcon(),
            action: ()=> console.log('the action')
        });
        this.menuList.addItem({
            name: 'Copy',
            icon: svgFactory.createCopyIcon(),
            action: ()=> console.log('the action')
        });
        this.menuList.addItem({
            name: 'Paste',
            icon: svgFactory.createPasteIcon(),
            action: ()=> console.log('the action')
        });

        this.getGui().appendChild(this.menuList.getGui());
    }


}
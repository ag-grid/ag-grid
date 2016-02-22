
import {Component} from "../widgets/component";
import {PostConstruct} from "../context/context";
import {MenuItem} from "./menuItem";
import {MenuItemParams} from "./menuItem";
import _ from '../utils';
import EventService from "../eventService";
import {Autowired} from "../context/context";
import {Context} from "../context/context";

export class MenuList extends Component {

    @Autowired('context') private context: Context;

    private static TEMPLATE =
        '<div class="ag-menu-list"></div>';

    constructor() {
        super(MenuList.TEMPLATE);
    }

    public addItem(params: MenuItemParams): void {
        var cMenuItem = new MenuItem(params);
        this.context.wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());
        cMenuItem.addEventListener(MenuItem.EVENT_ITEM_SELECTED, (event: any) => this.dispatchEvent(MenuItem.EVENT_ITEM_SELECTED, event));
    }

    public addSeparator(): void {
        this.getGui().appendChild(_.loadTemplate('<div class="ag-menu-separator"></div>'))
    }

}

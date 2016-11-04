
import {Component} from "./component";
import {MenuList} from "./menuList";
import {Autowired} from "../context/context";
import {PopupService} from "./popupService";
import {Utils as _} from '../utils';
import {SvgFactory} from "../svgFactory";

var svgFactory = SvgFactory.getInstance();

export class MenuItemComponent extends Component {

    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<div class="ag-menu-option">' +
        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
        '  <span id="eName" class="ag-menu-option-text"></span>' +
        '  <span id="eShortcut" class="ag-menu-option-shortcut"></span>' +
        '  <span id="ePopupPointer" class="ag-menu-option-popup-pointer"></span>' +
        '</div>';

    public static EVENT_ITEM_SELECTED = 'itemSelected';

    private params: MenuItem;

    constructor(params: MenuItem) {
        super(MenuItemComponent.TEMPLATE);

        this.params = params;

        if (params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '&#10004;';
        } else if (params.icon) {
            if (_.isNodeOrElement(params.icon)) {
                this.queryForHtmlElement('#eIcon').appendChild(<HTMLElement> params.icon);
            } else if (typeof params.icon === 'string') {
                this.queryForHtmlElement('#eIcon').innerHTML = <string> params.icon;
            } else {
                console.log('ag-Grid: menu item icon must be DOM node or string');
            }
        } else {
            // if i didn't put space here, the alignment was messed up, probably
            // fixable with CSS but i was spending to much time trying to figure
            // it out.
            this.queryForHtmlElement('#eIcon').innerHTML = '&nbsp;';
        }
        if (params.shortcut) {
            this.queryForHtmlElement('#eShortcut').innerHTML = params.shortcut;
        }
        if (params.childMenu) {
            this.queryForHtmlElement('#ePopupPointer').appendChild(svgFactory.createSmallArrowRightSvg());
        } else {
            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
        }
        this.queryForHtmlElement('#eName').innerHTML = params.name;

        if (params.disabled) {
            _.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        } else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
        }
    }

    private onOptionSelected(): void {
        this.dispatchEvent(MenuItemComponent.EVENT_ITEM_SELECTED, this.params);
        if (this.params.action) {
            this.params.action();
        }
    }
}

export interface MenuItem {
    name: string,
    disabled?: boolean,
    shortcut?: string,
    action?: ()=>void,
    checked?: boolean,
    icon?: HTMLElement|string,
    childMenu?: MenuList
}
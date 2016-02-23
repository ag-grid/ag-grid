
import {Component} from "./component";
import {MenuList} from "./menuList";
import {Autowired} from "../context/context";
import PopupService from "./agPopupService";
import _ from '../utils';
import SvgFactory from "../svgFactory";

var svgFactory = SvgFactory.getInstance();

export class MenuItem extends Component {

    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<div class="ag-menu-option">' +
        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
        '  <span id="ePopupPointer" class="ag-menu-option-popup-pointer"></span>' +
        '  <span id="eName" class="ag-menu-option-text"></span>' +
        '  <span style="clear: both;"></span>' +
        '</div>';

    public static EVENT_ITEM_SELECTED = 'itemSelected';

    private params: MenuItemParams;

    constructor(params: MenuItemParams) {
        super(MenuItem.TEMPLATE);

        this.params = params;

        if (params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '&#10004;';
        } else if (params.icon) {
            this.queryForHtmlElement('#eIcon').appendChild(params.icon);
        } else {
            // if i didn't put space here, the alignment was messed up, probably
            // fixable with CSS but i was spending to much time trying to figure
            // it out.
            this.queryForHtmlElement('#eIcon').innerHTML = '&nbsp;';
        }
        if (params.childMenu) {
            this.queryForHtmlElement('#ePopupPointer').appendChild(svgFactory.createSmallArrowRightSvg());
        } else {
            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
        }
        this.queryForHtmlElement('#eName').innerHTML = params.name;

        this.addGuiEventListener('click', this.onOptionSelected.bind(this));
    }

    private onOptionSelected(): void {
        if (this.params.action) {
            this.params.action();
        }
        this.dispatchEvent(MenuItem.EVENT_ITEM_SELECTED, this.params);
    }
}

export interface MenuItemParams {
    name: string,
    action?: ()=>void,
    checked?: boolean,
    icon?: HTMLElement,
    childMenu?: MenuList
}
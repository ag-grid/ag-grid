
import {Component} from "../widgets/component";
import {MenuList} from "./menuList";
import {Autowired} from "../context/context";
import PopupService from "../widgets/agPopupService";
import _ from '../utils';

export class MenuItem extends Component {

    @Autowired('popupService') private popupService: PopupService;

    private static TEMPLATE =
        '<div class="ag-menu-option">' +
        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
        '  <span id="eName" class="ag-menu-option-text"></span>' +
        '</div>';

    public static EVENT_ITEM_SELECTED = 'itemSelected';

    private params: MenuItemParams;

    constructor(params: MenuItemParams) {
        super(MenuItem.TEMPLATE);

        this.params = params;

        if (params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '&#10004;';
        }
        this.queryForHtmlElement('#eName').innerHTML = params.name;
        this.getGui().addEventListener('click', this.onOptionSelected.bind(this));
    }

    private onOptionSelected(): void {
        if (this.params.childMenu) {
            var ePopup = _.loadTemplate('<div class="ag-menu"></div>');
            ePopup.appendChild(this.params.childMenu.getGui());

            var hidePopup = this.popupService.addAsModalPopup(
                ePopup,
                true,
                null // closedCallback ()=> menu.destroy()
            );
            this.popupService.positionPopupForMenu({
                eventSource: this.getGui(),
                ePopup: ePopup
            });
        } else {
            this.dispatchEvent(MenuItem.EVENT_ITEM_SELECTED, this.params);
            this.params.action();
        }
    }
}

export interface MenuItemParams {
    name: string,
    action?: ()=>void,
    checked?: boolean,
    childMenu?: MenuList
}
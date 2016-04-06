import {Component} from "./component";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Utils as _} from '../utils';

export class VirtualListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        '<div id="itemForRepeat" class="ag-filter-item">' +
        '<label>'+
        '<input type="checkbox" class="ag-filter-checkbox"/>'+
        '<span class="ag-filter-value"></span>'+
        '</label>' +
        '</div>';

    private eCheckbox: HTMLInputElement;

    constructor(value: any, cellRenderer: Function) {
        super(VirtualListItem.TEMPLATE);
        this.render(value, cellRenderer);

        this.eCheckbox = this.queryForHtmlInputElement("input");

        this.addDestroyableEventListener(this.eCheckbox, 'click', ()=> this.dispatchEvent(VirtualListItem.EVENT_SELECTED) );
    }

    public isSelected(): boolean {
        return this.eCheckbox.checked;
    }

    public setSelected(selected: boolean): void {
        this.eCheckbox.checked = selected;
    }

    public render(value: any, cellRenderer: Function): void {

        var valueElement = this.queryForHtmlElement(".ag-filter-value");

        // var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (cellRenderer) {
            // renderer provided, so use it
            var resultFromRenderer = cellRenderer({ value: value });

            if (_.isNode(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                valueElement.appendChild(resultFromRenderer);
            } else {
                // otherwise assume it was html, so just insert
                valueElement.innerHTML = resultFromRenderer;
            }

        } else {
            // otherwise display as a string
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var blanksText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            var displayNameOfValue = value === null ? blanksText : value;
            valueElement.innerHTML = displayNameOfValue;
        }

    }

}

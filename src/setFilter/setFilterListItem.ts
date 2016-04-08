import {Component, Autowired, PostConstruct, GridOptionsWrapper, Utils as _} from "ag-grid/main";

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        '<div class="ag-filter-item">' +
        '<label>'+
        '<input type="checkbox" class="ag-filter-checkbox"/>'+
        '<span class="ag-filter-value"></span>'+
        '</label>' +
        '</div>';

    private eCheckbox: HTMLInputElement;

    private value: any;
    private cellRenderer: Function;

    constructor(value: any, cellRenderer: Function) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.cellRenderer = cellRenderer;
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox = this.queryForHtmlInputElement("input");

        this.addDestroyableEventListener(this.eCheckbox, 'click', ()=> this.dispatchEvent(SetFilterListItem.EVENT_SELECTED) );
    }

    public isSelected(): boolean {
        return this.eCheckbox.checked;
    }

    public setSelected(selected: boolean): void {
        this.eCheckbox.checked = selected;
    }

    public render(): void {

        var valueElement = this.queryForHtmlElement(".ag-filter-value");

        // var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.cellRenderer) {
            // renderer provided, so use it
            var resultFromRenderer = this.cellRenderer({ value: this.value });

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
            var displayNameOfValue = this.value === null ? blanksText : this.value;
            valueElement.innerHTML = displayNameOfValue;
        }

    }

}

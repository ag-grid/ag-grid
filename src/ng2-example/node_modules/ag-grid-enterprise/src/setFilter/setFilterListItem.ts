import {Component, ICellRenderer, ICellRendererFunc, CellRendererService, Autowired, PostConstruct, GridOptionsWrapper, Utils as _} from "ag-grid/main";

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;

    private static TEMPLATE =
        '<label class="ag-set-filter-item">'+
        '<input type="checkbox" class="ag-filter-checkbox"/>'+
        '<span class="ag-filter-value"></span>'+
        '</label>';

    private eCheckbox: HTMLInputElement;

    private value: any;
    private cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;

    constructor(value: any, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string) {
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
            var component = this.cellRendererService.useCellRenderer(this.cellRenderer, valueElement, {value: this.value});
            if (component && component.destroy) {
                this.addDestroyFunc( component.destroy.bind(component) );
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

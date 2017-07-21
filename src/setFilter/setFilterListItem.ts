import {
    Component,
    ICellRendererFunc,
    CellRendererService,
    Autowired,
    PostConstruct,
    GridOptionsWrapper,
    ICellRendererComp,
    SvgFactory,
    _,
    Column
} from "ag-grid/main";

let svgFactory = SvgFactory.getInstance();

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;

    private static TEMPLATE =
        '<label class="ag-set-filter-item">'+
        '<div class="ag-filter-checkbox"></div>'+
        '<span class="ag-filter-value"></span>'+
        '</label>';

    private eCheckbox: HTMLElement;
    private eClickableArea: HTMLElement;
    private selected: boolean = true;

    private value: any;
    private column: Column;
    private cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;

    constructor(value: any, cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string, column: Column) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.cellRenderer = cellRenderer;
        this.column = column;
    }

    @PostConstruct
    private init(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column, svgFactory.createCheckboxCheckedIcon);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column, svgFactory.createCheckboxUncheckedIcon);
        this.eCheckbox = this.queryForHtmlElement(".ag-filter-checkbox");
        this.eClickableArea = this.getGui();

        this.updateCheckboxIcon();
        this.render();


        let listener = () => {
            this.selected = !this.selected;
            this.updateCheckboxIcon();
            return this.dispatchEvent(SetFilterListItem.EVENT_SELECTED);
        };
        this.addDestroyableEventListener(this.eClickableArea, 'click', listener);
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
        this.updateCheckboxIcon();
    }

    private updateCheckboxIcon (){
        if (this.eCheckbox.children){
            for (let i=0; i<this.eCheckbox.children.length; i++){
                this.eCheckbox.removeChild(this.eCheckbox.children.item(i));
            }
        }

        if (this.isSelected()){
            this.eCheckbox.appendChild(this.eCheckedIcon);
        }else{
            this.eCheckbox.appendChild(this.eUncheckedIcon);
        }
    }

    public render(): void {

        let valueElement = this.queryForHtmlElement(".ag-filter-value");

        // let valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.cellRenderer) {
            let component = this.cellRendererService.useCellRenderer(this.cellRenderer, valueElement, {value: this.value});
            if (component && component.destroy) {
                this.addDestroyFunc( component.destroy.bind(component) );
            }
        } else {
            // otherwise display as a string
            let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            let blanksText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            let displayNameOfValue = this.value === null ? blanksText : this.value;
            valueElement.innerHTML = displayNameOfValue;
        }

    }

}

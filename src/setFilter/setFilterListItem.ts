import {
    Component,
    CellRendererService,
    ValueFormatterService,
    Autowired,
    PostConstruct,
    GridOptionsWrapper,
    _,
    Column,
    AgEvent,
    Promise,
    ICellRendererComp
} from "ag-grid/main";

export interface SelectedEvent extends AgEvent {
}

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

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

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;

    constructor(value: any, column: Column) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.column = column;

    }

    @PostConstruct
    private init(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eCheckbox = this.queryForHtmlElement(".ag-filter-checkbox");
        this.eClickableArea = this.getGui();

        this.updateCheckboxIcon();
        this.render();

        let listener = (mouseEvent: MouseEvent) => {
            _.addAgGridEventPath(mouseEvent);
            this.selected = !this.selected;
            this.updateCheckboxIcon();
            let event: SelectedEvent = {
                type: SetFilterListItem.EVENT_SELECTED
            };
            return this.dispatchEvent(event);
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
        let valueFormatted = this.valueFormatterService.formatValue(this.column, null, null, this.value);

        let colDef = this.column.getColDef();
        let valueObj = {value: this.value, valueFormatted: valueFormatted};

        let componentPromise:Promise<ICellRendererComp> = this.cellRendererService.useFilterCellRenderer(colDef, valueElement, valueObj);

        if (!componentPromise) return;

        componentPromise.then(component=>{
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        })
    }
}

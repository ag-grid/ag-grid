import {
    AgCheckbox,
    AgEvent,
    Autowired,
    ColDef,
    Column,
    Component,
    GridOptionsWrapper,
    ICellRendererComp,
    ISetFilterParams,
    PostConstruct,
    Promise,
    UserComponentFactory,
    ValueFormatterService,
    RefSelector,
    _
} from "@ag-grid-community/core";


export interface SelectedEvent extends AgEvent {}

export class SetFilterListItem extends Component {
    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private static TEMPLATE = 
        `<label class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
            <span class="ag-set-filter-item-value"></span>
        </label>`;

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;

    private selected: boolean = true;
    private value: any;
    private column: Column;

    constructor(value: any, column: Column) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.column = column;
    }

    private useCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): Promise<ICellRendererComp> {
        const cellRendererPromise: Promise<ICellRendererComp> = this.userComponentFactory.newCellRenderer(target.filterParams as ISetFilterParams, params);
        if (cellRendererPromise != null) {
            _.bindCellRendererToHtmlElement(cellRendererPromise, eTarget);
        } else {
            if (params.valueFormatted == null && params.value == null) {
                const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            } else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.onValueChange((value) => {
            this.selected = value;
            const event: SelectedEvent = {
                type: SetFilterListItem.EVENT_SELECTED
            };
            return this.dispatchEvent(event);
        });
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
        this.updateCheckboxIcon();
    }

    private updateCheckboxIcon() {
        this.eCheckbox.setValue(this.isSelected(), true);
    }

    public render(): void {
        const valueElement = this.queryForHtmlElement('.ag-set-filter-item-value');
        const colDef = this.column.getColDef();
        const filterValueFormatter = this.getFilterValueFormatter(colDef);
        const valueFormatted = this.valueFormatterService.formatValue(this.column, null, null, this.value, filterValueFormatter);

        const params = {
            value: this.value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };

        const componentPromise: Promise<ICellRendererComp> = this.useCellRenderer(colDef, valueElement, params);

        if (!componentPromise) { return; }

        componentPromise.then(component => {
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        });
    }

    private getFilterValueFormatter(colDef: ColDef) {
        return colDef.filterParams ? (<ISetFilterParams>colDef.filterParams).valueFormatter : undefined;
    }
}

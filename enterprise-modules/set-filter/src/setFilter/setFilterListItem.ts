import {
    AgCheckbox,
    AgEvent,
    Autowired,
    ColDef,
    Component,
    GridOptionsWrapper,
    ISetFilterParams,
    PostConstruct,
    UserComponentFactory,
    ValueFormatterService,
    RefSelector,
    _,
    TooltipFeature
} from '@ag-grid-community/core';

export interface SelectedEvent extends AgEvent { }

export class SetFilterListItem extends Component {
    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eFilterItemValue') private eFilterItemValue: HTMLElement;

    private static TEMPLATE = /* html */`
        <label class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
            <span ref="eFilterItemValue" class="ag-set-filter-item-value"></span>
        </label>`;

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;

    private selected: boolean = true;
    private tooltipText: string;

    constructor(private readonly value: any, private readonly params: ISetFilterParams) {
        super(SetFilterListItem.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.onValueChange(value => {
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
        const { value, params: { column } } = this;
        const colDef = column.getColDef();
        const filterValueFormatter = this.getFilterValueFormatter(colDef);
        const valueFormatted = this.valueFormatterService.formatValue(column, null, null, value, filterValueFormatter);
        const valueToRender = valueFormatted == null ? value : valueFormatted;

        if (this.params.showTooltips) {
            this.tooltipText = _.escape(valueToRender);

            if (_.exists(this.tooltipText)) {
                if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                    this.eFilterItemValue.title = this.tooltipText;
                } else {
                    this.addFeature(new TooltipFeature(this, 'setFilterValue'));
                }
            }
        }

        const params: any = {
            value: valueToRender,
            api: this.gridOptionsWrapper.getApi()
        };

        this.renderCell(colDef, this.eFilterItemValue, params);
    }

    private getFilterValueFormatter(colDef: ColDef) {
        return colDef.filterParams ? (<ISetFilterParams>colDef.filterParams).valueFormatter : undefined;
    }

    private renderCell(target: ColDef, eTarget: HTMLElement, params: any): void {
        const filterParams = target.filterParams as ISetFilterParams;
        const cellRendererPromise = this.userComponentFactory.newCellRenderer(filterParams, params);

        if (cellRendererPromise == null) {
            if (params.value == null) {
                const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = `(${localeTextFunc('blanks', 'Blanks')})`;
            } else {
                eTarget.innerText = params.value;
            }

            return;
        }

        _.bindCellRendererToHtmlElement(cellRendererPromise, eTarget);

        cellRendererPromise.then(component => {
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        });
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }

    public getTooltipText(): string {
        return this.tooltipText;
    }
}

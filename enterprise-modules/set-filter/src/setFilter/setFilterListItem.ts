import {
    AgCheckbox,
    AgEvent,
    Autowired,
    ColDef,
    Component,
    Column,
    GridOptionsWrapper,
    ISetFilterParams,
    PostConstruct,
    UserComponentFactory,
    ValueFormatterService,
    RefSelector,
    TooltipFeature,
    ISetFilterCellRendererParams,
    _
} from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';

export interface SelectedEvent extends AgEvent { }

export class SetFilterListItem extends Component {
    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private static TEMPLATE = /* html */`
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private eCheckbox: AgCheckbox;

    private selected: boolean = true;
    private tooltipText: string;

    constructor(
        private readonly value: any,
        private readonly params: ISetFilterParams,
        private readonly translate: (key: keyof ISetFilterLocaleText) => string) {
        super(SetFilterListItem.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.onValueChange(value => {
            this.selected = value;

            const event: SelectedEvent = { type: SetFilterListItem.EVENT_SELECTED };

            return this.dispatchEvent(event);
        });
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public setSelected(selected: boolean, forceEvent?: boolean): void {
        this.selected = selected;
        this.updateCheckboxIcon(forceEvent);
    }

    private updateCheckboxIcon(forceEvent?: boolean) {
        this.eCheckbox.setValue(this.isSelected(), !forceEvent);
    }

    public render(): void {
        const { value, params: { column, colDef } } = this;
        const formattedValue = this.getFormattedValue(colDef, column, value);

        if (this.params.showTooltips) {
            this.tooltipText = _.escape(formattedValue != null ? formattedValue : value);

            if (_.exists(this.tooltipText)) {
                if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                    this.getGui().setAttribute('title', this.tooltipText);
                } else {
                    this.createManagedBean(new TooltipFeature(this, 'setFilterValue'));
                }
            }
        }

        const params: ISetFilterCellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        this.renderCell(colDef, params);
    }

    private getFormattedValue(colDef: ColDef, column: Column, value: any) {
        const filterParams = colDef.filterParams as ISetFilterParams;
        const formatter = filterParams == null ? null : filterParams.valueFormatter;

        return this.valueFormatterService.formatValue(column, null, null, value, formatter, false);
    }

    private renderCell(target: ColDef, params: any): void {
        const filterParams = target.filterParams as ISetFilterParams;
        const cellRendererPromise = this.userComponentFactory.newSetFilterCellRenderer(filterParams, params);

        if (cellRendererPromise == null) {
            const valueToRender = params.valueFormatted == null ? params.value : params.valueFormatted;

            this.eCheckbox.setLabel(valueToRender == null ? `(${this.translate('blanks')})` : valueToRender);

            return;
        }

        cellRendererPromise.then(component => {
            const rendererGui = component.getGui();
            this.eCheckbox.setLabel(rendererGui);
            this.addDestroyFunc(() => this.getContext().destroyBean(component))
        });
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }

    public getTooltipText(): string {
        return this.tooltipText;
    }
}

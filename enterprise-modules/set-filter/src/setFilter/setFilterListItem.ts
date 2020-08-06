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

export interface SetFilterListItemSelectionChangedEvent extends AgEvent {
    isSelected: boolean;
}

export class SetFilterListItem extends Component {
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';

    @Autowired('gridOptionsWrapper') private readonly gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private static TEMPLATE = /* html */`
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private readonly eCheckbox: AgCheckbox;

    private tooltipText: string;

    constructor(
        private readonly value: string | (() => string),
        private readonly params: ISetFilterParams,
        private readonly translate: (key: keyof ISetFilterLocaleText) => string,
        private isSelected?: boolean) {
        super(SetFilterListItem.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.onValueChange(value => {
            this.isSelected = value;

            const event: SetFilterListItemSelectionChangedEvent = {
                type: SetFilterListItem.EVENT_SELECTION_CHANGED,
                isSelected: value,
            };

            this.dispatchEvent(event);
        });
    }

    public toggleSelected(): void {
        this.isSelected = !this.isSelected;
        this.eCheckbox.setValue(this.isSelected);
    }

    public render(): void {
        const { params: { column, colDef } } = this;

        let { value } = this;
        let formattedValue: string = null;

        if (typeof value === 'function') {
            value = value();
        } else {
            formattedValue = this.getFormattedValue(colDef, column, value);
        }

        if (this.params.showTooltips) {
            this.tooltipText = _.escapeString(formattedValue != null ? formattedValue : value);

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

            this.eCheckbox.setLabel(valueToRender == null ? this.translate('blanks') : valueToRender);

            return;
        }

        cellRendererPromise.then(component => {
            this.eCheckbox.setLabel(component.getGui());
            this.addDestroyFunc(() => this.destroyBean(component));
        });
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }

    public getTooltipText(): string {
        return this.tooltipText;
    }
}

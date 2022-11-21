import {
    _,
    AgCheckbox,
    AgEvent,
    Autowired,
    ColDef,
    Column,
    Component,
    ISetFilterCellRendererParams,
    ISetFilterParams,
    ITooltipParams,
    PostConstruct,
    RefSelector,
    UserComponentFactory,
    ValueFormatterService,
    WithoutGridCommon
} from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';

export interface SetFilterListItemSelectionChangedEvent extends AgEvent {
    isSelected: boolean;
}

export class SetFilterListItem extends Component {
    public static EVENT_SELECTION_CHANGED = 'selectionChanged';

    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private static TEMPLATE = /* html */`
        <div class="ag-set-filter-item">
            <ag-checkbox ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
        </div>`;

    @RefSelector('eCheckbox') private readonly eCheckbox: AgCheckbox;

    constructor(
        private readonly value: string | (() => string),
        private readonly params: ISetFilterParams,
        private readonly translate: (key: keyof ISetFilterLocaleText) => string,
        private isSelected?: boolean,
    ) {
        super(SetFilterListItem.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.render();

        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);

        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }

        this.eCheckbox.onValueChange(value => {
            const parsedValue = value || false;

            this.isSelected = parsedValue;

            const event: SetFilterListItemSelectionChangedEvent = {
                type: SetFilterListItem.EVENT_SELECTION_CHANGED,
                isSelected: parsedValue,
            };

            this.dispatchEvent(event);
        });
    }

    public toggleSelected(): void {
        if (!!this.params.readOnly) { return; }

        this.isSelected = !this.isSelected;
        this.eCheckbox.setValue(this.isSelected);
    }

    public render(): void {
        const { params: { column } } = this;

        let { value } = this;
        let formattedValue: string | null = null;

        if (typeof value === 'function') {
            value = value();
        } else {
            formattedValue = this.getFormattedValue(this.params, column, value);
        }

        if (this.params.showTooltips) {
            const tooltipValue = formattedValue != null ? formattedValue : value;
            this.setTooltip(tooltipValue);
        }

        const params: ISetFilterCellRendererParams = {
            value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context'),
            colDef: this.params.colDef,
            column: this.params.column,
        };

        this.renderCell(params);
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        return res;
    }

    private getFormattedValue(filterParams: ISetFilterParams, column: Column, value: any) {
        const formatter = filterParams && filterParams.valueFormatter;

        return this.valueFormatterService.formatValue(column, null, value, formatter, false);
    }

    private renderCell(params: ISetFilterCellRendererParams): void {
        const compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, params);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;

        if (cellRendererPromise == null) {
            const valueToRender = params.valueFormatted == null ? params.value : params.valueFormatted;

            this.eCheckbox.setLabel(valueToRender == null ? this.translate('blanks') : valueToRender);

            return;
        }

        cellRendererPromise.then(component => {
            if (component) {
                this.eCheckbox.setLabel(component.getGui());
                this.addDestroyFunc(() => this.destroyBean(component));
            }
        });
    }

    public getComponentHolder(): ColDef {
        return this.params.column.getColDef();
    }
}

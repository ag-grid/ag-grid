import { DateFilter, DateFilterModel } from './dateFilter';
import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { IDateParams } from '../../../rendering/dateComponent';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
import { DateCompWrapper } from './dateCompWrapper';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { ISimpleFilterModel } from '../simpleFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { ProvidedFilter } from '../providedFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { setDisplayed } from '../../../utils/dom';
import { parseDateTimeFromString, serialiseDate } from '../../../utils/date';
import { debounce } from '../../../utils/function';
import { WithoutGridCommon } from '../../../interfaces/iCommon';

export class DateFloatingFilter extends SimpleFloatingFilter {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    @RefSelector('eReadOnlyText') private readonly eReadOnlyText: AgInputTextField;
    @RefSelector('eDateWrapper') private readonly eDateWrapper: HTMLInputElement;

    private dateComp: DateCompWrapper;
    private params: IFloatingFilterParams<DateFilter>;

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eReadOnlyText"></ag-input-text-field>
                <div ref="eDateWrapper" style="display: flex;"></div>
            </div>`);
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    public init(params: IFloatingFilterParams<DateFilter>): void {
        super.init(params);
        this.params = params;
        this.createDateComponent();
        const translate = this.localeService.getLocaleTextFunc();
        this.eReadOnlyText
            .setDisabled(true)
            .setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }

    protected setEditable(editable: boolean): void {
        setDisplayed(this.eDateWrapper, editable);
        setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }

    public onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect provided date floating filters
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) { return; }

        super.setLastTypeFromModel(model);

        const allowEditing = !this.isReadOnly() &&
            this.canWeEditAfterModelFromParentFilter(model);

        this.setEditable(allowEditing);

        if (allowEditing) {
            if (model) {
                const dateModel = model as DateFilterModel;

                this.dateComp.setDate(parseDateTimeFromString(dateModel.dateFrom));
            } else {
                this.dateComp.setDate(null);
            }

            this.eReadOnlyText.setValue('');
        } else {
            this.params.parentFilterInstance(filterInstance => {
                this.eReadOnlyText.setValue(model ? filterInstance.getModelAsString(model) : null);
                this.dateComp.setDate(null);
            });
        }
    }

    private onDateChanged(): void {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = serialiseDate(filterValueDate);

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const date = parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, date);
            }
        });
    }

    private createDateComponent(): void {
        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        const dateComponentParams: WithoutGridCommon<IDateParams> = {
            onDateChanged: debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };

        this.dateComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eDateWrapper);

        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}

import type { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import type { BeanCollection } from '../../../context/context';
import type { FilterChangedEvent } from '../../../events';
import type { IDateParams } from '../../../interfaces/dateComponent';
import type { WithoutGridCommon } from '../../../interfaces/iCommon';
import { _parseDateTimeFromString, _serialiseDate } from '../../../utils/date';
import { _setDisplayed } from '../../../utils/dom';
import { _debounce } from '../../../utils/function';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { RefPlaceholder } from '../../../widgets/component';
import type { IFloatingFilterParams } from '../../floating/floatingFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { ProvidedFilter } from '../providedFilter';
import type { ISimpleFilterModel, SimpleFilterModelFormatter } from '../simpleFilter';
import { DateCompWrapper } from './dateCompWrapper';
import type { DateFilterModel, DateFilterParams } from './dateFilter';
import { DateFilter, DateFilterModelFormatter } from './dateFilter';

export class DateFloatingFilter extends SimpleFloatingFilter {
    private userComponentFactory: UserComponentFactory;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.userComponentFactory = beans.userComponentFactory;
    }

    private readonly eReadOnlyText: AgInputTextField = RefPlaceholder;
    private readonly eDateWrapper: HTMLInputElement = RefPlaceholder;

    private dateComp: DateCompWrapper;
    private params: IFloatingFilterParams<DateFilter>;
    private filterParams: DateFilterParams;
    private filterModelFormatter: DateFilterModelFormatter;

    constructor() {
        super(
            /* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field data-ref="eReadOnlyText"></ag-input-text-field>
                <div data-ref="eDateWrapper" style="display: flex;"></div>
            </div>`,
            [AgInputTextField]
        );
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    public init(params: IFloatingFilterParams<DateFilter>): void {
        super.init(params);
        this.params = params;
        this.filterParams = params.filterParams;

        this.createDateComponent();
        this.filterModelFormatter = new DateFilterModelFormatter(
            this.filterParams,
            this.localeService,
            this.optionsFactory
        );
        const translate = this.localeService.getLocaleTextFunc();
        this.eReadOnlyText.setDisabled(true).setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }

    public onParamsUpdated(params: IFloatingFilterParams<DateFilter>): void {
        this.refresh(params);
    }

    public refresh(params: IFloatingFilterParams<DateFilter>): void {
        super.refresh(params);
        this.params = params;
        this.filterParams = params.filterParams;

        this.updateDateComponent();
        this.filterModelFormatter.updateParams({
            optionsFactory: this.optionsFactory,
            dateFilterParams: this.filterParams,
        });
        this.updateCompOnModelChange(params.currentParentModel());
    }

    private updateCompOnModelChange(model: any): void {
        // Update the read-only text field
        const allowEditing = !this.isReadOnly() && this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);

        if (allowEditing) {
            if (model) {
                const dateModel = model as DateFilterModel;
                this.dateComp.setDate(_parseDateTimeFromString(dateModel.dateFrom));
            } else {
                this.dateComp.setDate(null);
            }

            this.eReadOnlyText.setValue('');
        } else {
            this.eReadOnlyText.setValue(this.filterModelFormatter.getModelAsString(model));
            this.dateComp.setDate(null);
        }
    }

    protected setEditable(editable: boolean): void {
        _setDisplayed(this.eDateWrapper, editable);
        _setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }

    public onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect provided date floating filters
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            return;
        }

        super.setLastTypeFromModel(model);
        this.updateCompOnModelChange(model);
    }

    private onDateChanged(): void {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = _serialiseDate(filterValueDate);

        this.params.parentFilterInstance((filterInstance) => {
            if (filterInstance) {
                const date = _parseDateTimeFromString(filterValueText);
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, date);
            }
        });
    }

    private getDateComponentParams(): WithoutGridCommon<IDateParams> {
        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        return {
            onDateChanged: _debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams,
        };
    }

    private createDateComponent(): void {
        this.dateComp = new DateCompWrapper(
            this.getContext(),
            this.userComponentFactory,
            this.getDateComponentParams(),
            this.eDateWrapper,
            (dateComp) => {
                dateComp.setInputAriaLabel(this.getAriaLabel(this.params));
            }
        );

        this.addDestroyFunc(() => this.dateComp.destroy());
    }

    private updateDateComponent(): void {
        const params = this.gos.addGridCommonParams(this.getDateComponentParams());
        this.dateComp.updateParams(params);
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }
}

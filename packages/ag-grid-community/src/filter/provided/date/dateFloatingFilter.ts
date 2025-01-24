import type { IDateParams } from '../../../interfaces/dateComponent';
import type { WithoutGridCommon } from '../../../interfaces/iCommon';
import { _parseDateTimeFromString, _serialiseDate } from '../../../utils/date';
import { _setDisplayed } from '../../../utils/dom';
import { _debounce } from '../../../utils/function';
import type { AgInputTextField } from '../../../widgets/agInputTextField';
import { AgInputTextFieldSelector } from '../../../widgets/agInputTextField';
import { RefPlaceholder } from '../../../widgets/component';
import type { FloatingFilterDisplayParams, IFloatingFilterParams } from '../../floating/floatingFilter';
import { getDebounceMs } from '../../floating/provided/providedFilterUtils';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import type { ISimpleFilterModel } from '../iSimpleFilter';
import { DateCompWrapper } from './dateCompWrapper';
import type { DateFilter } from './dateFilter';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import type { DateFilterModel, DateFilterParams } from './iDateFilter';

export class DateFloatingFilter extends SimpleFloatingFilter<IFloatingFilterParams<DateFilter>> {
    private readonly eReadOnlyText: AgInputTextField = RefPlaceholder;
    private readonly eDateWrapper: HTMLInputElement = RefPlaceholder;

    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;
    private dateComp: DateCompWrapper;
    protected readonly filterType = 'date';
    protected readonly defaultOptions = DEFAULT_DATE_FILTER_OPTIONS;

    constructor() {
        super(
            /* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field data-ref="eReadOnlyText"></ag-input-text-field>
                <div data-ref="eDateWrapper" style="display: flex;"></div>
            </div>`,
            [AgInputTextFieldSelector]
        );
    }

    protected override setParams(params: IFloatingFilterParams<DateFilter>): void {
        super.setParams(params);

        this.createDateComponent();
        const translate = this.getLocaleTextFunc();
        this.eReadOnlyText.setDisabled(true).setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }

    protected override updateParams(params: IFloatingFilterParams<DateFilter, any, any>): void {
        super.updateParams(params);
        const dateParams = this.gos.addGridCommonParams(this.getDateComponentParams());
        this.dateComp.updateParams(dateParams);

        this.updateCompOnModelChange(params.currentParentModel());
    }

    private updateCompOnModelChange(model: any): void {
        // Update the read-only text field
        const allowEditing = !this.readOnly && this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(allowEditing);

        if (allowEditing) {
            const dateModel = (model as DateFilterModel) ? _parseDateTimeFromString(model.dateFrom) : null;
            this.dateComp.setDate(dateModel);

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

    protected onModelUpdated(model: ISimpleFilterModel): void {
        super.setLastTypeFromModel(model);
        this.updateCompOnModelChange(model);
    }

    private onDateChanged(): void {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = _serialiseDate(filterValueDate);

        if (this.reactive) {
            const reactiveParams = this.params as unknown as FloatingFilterDisplayParams<any, any, DateFilterModel>;
            reactiveParams.filterModifiedCallback();

            const model = reactiveParams.model;
            const newModel =
                filterValueText == null
                    ? null
                    : ({
                          ...(model ?? {
                              filterType: this.filterType,
                              type: this.lastType ?? this.optionsFactory.defaultOption,
                          }),
                          dateFrom: filterValueText,
                      } as DateFilterModel);
            reactiveParams.onModelChange(newModel, { afterFloatingFilter: true });
        } else {
            this.params.parentFilterInstance((filterInstance) => {
                if (filterInstance) {
                    const date = _parseDateTimeFromString(filterValueText);
                    filterInstance.onFloatingFilterChanged(this.lastType || null, date);
                }
            });
        }
    }

    private getDateComponentParams(): WithoutGridCommon<IDateParams> {
        const { filterParams, column } = this.params;
        const debounceMs = getDebounceMs(filterParams as DateFilterParams, this.defaultDebounceMs);
        return {
            onDateChanged: _debounce(this, this.onDateChanged.bind(this), debounceMs),
            filterParams: column.getColDef().filterParams,
            location: 'floatingFilter',
        };
    }

    private createDateComponent(): void {
        const {
            beans: { context, userCompFactory },
            eDateWrapper,
        } = this;
        this.dateComp = new DateCompWrapper(
            context,
            userCompFactory,
            this.getDateComponentParams(),
            eDateWrapper,
            (dateComp) => {
                dateComp.setInputAriaLabel(this.getAriaLabel(this.params));
            }
        );

        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}

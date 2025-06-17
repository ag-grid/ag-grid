import { _addGridCommonParams } from '../../../gridOptionsUtils';
import type { IDateParams } from '../../../interfaces/dateComponent';
import { _parseDateTimeFromString, _serialiseDate } from '../../../utils/date';
import type { ElementParams } from '../../../utils/dom';
import { _setDisplayed } from '../../../utils/dom';
import { _debounce } from '../../../utils/function';
import type { AgInputTextField } from '../../../widgets/agInputTextField';
import { AgInputTextFieldSelector } from '../../../widgets/agInputTextField';
import { RefPlaceholder } from '../../../widgets/component';
import type { FloatingFilterDisplayParams, IFloatingFilterParams } from '../../floating/floatingFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import type { ISimpleFilterModel } from '../iSimpleFilter';
import { getDebounceMs } from '../providedFilterUtils';
import { DateCompWrapper } from './dateCompWrapper';
import type { DateFilter } from './dateFilter';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import type { DateFilterModel, DateFilterParams } from './iDateFilter';

const DateFloatingFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-floating-filter-input',
    role: 'presentation',
    children: [
        {
            tag: 'ag-input-text-field',
            ref: 'eReadOnlyText',
        },
        { tag: 'div', ref: 'eDateWrapper', cls: 'ag-date-floating-filter-wrapper' },
    ],
};

export class DateFloatingFilter extends SimpleFloatingFilter<IFloatingFilterParams<DateFilter>> {
    private readonly eReadOnlyText: AgInputTextField = RefPlaceholder;
    private readonly eDateWrapper: HTMLInputElement = RefPlaceholder;

    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;
    private dateComp: DateCompWrapper;
    protected readonly filterType = 'date';
    protected readonly defaultOptions = DEFAULT_DATE_FILTER_OPTIONS;

    constructor() {
        super(DateFloatingFilterElement, [AgInputTextFieldSelector]);
    }

    protected override setParams(params: IFloatingFilterParams<DateFilter>): void {
        super.setParams(params);

        this.createDateComponent();
        const translate = this.getLocaleTextFunc();
        this.eReadOnlyText.setDisabled(true).setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
    }

    protected override updateParams(params: IFloatingFilterParams<DateFilter, any, any>): void {
        super.updateParams(params);
        this.dateComp.updateParams(this.getDateComponentParams());

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

        if (this.reactive) {
            const reactiveParams = this.params as unknown as FloatingFilterDisplayParams<any, any, DateFilterModel>;
            reactiveParams.onUiChange();

            const model = reactiveParams.model;
            const filterValueText = _serialiseDate(filterValueDate);
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
                filterInstance?.onFloatingFilterChanged(this.lastType || null, filterValueDate);
            });
        }
    }

    private getDateComponentParams(): IDateParams {
        const { filterParams } = this.params;
        const debounceMs = getDebounceMs(filterParams as DateFilterParams, this.defaultDebounceMs);
        return _addGridCommonParams(this.gos, {
            onDateChanged: _debounce(this, this.onDateChanged.bind(this), debounceMs),
            filterParams,
            location: 'floatingFilter',
        });
    }

    private createDateComponent(): void {
        const {
            beans: { context, userCompFactory },
            eDateWrapper,
            params,
        } = this;
        this.dateComp = new DateCompWrapper(
            context,
            userCompFactory,
            params.column.getColDef(),
            this.getDateComponentParams(),
            eDateWrapper,
            (dateComp) => {
                dateComp.setInputAriaLabel(this.getAriaLabel(params));
            }
        );

        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}

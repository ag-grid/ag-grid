import { RefPlaceholder, _debounce, _parseDateTimeFromString, _serialiseDate, _setDisplayed } from 'ag-stack';

import { AgInputTextFieldSelector } from '../../../agWidgets/agInputTextField';
import type { AgColumn } from '../../../entities/agColumn';
import { _addGridCommonParams } from '../../../gridOptionsUtils';
import type { IDateParams } from '../../../interfaces/dateComponent';
import type { Column } from '../../../interfaces/iColumn';
import type { ElementParams } from '../../../utils/element';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FloatingFilterDisplayParams, IFloatingFilterParams } from '../../floating/floatingFilter';
import { _addFloatingFilterValueTooltip } from '../../floating/provided/floatingFilterValueTooltip';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import type { ISimpleFilterModel } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { _isUseApplyButton, getDebounceMs } from '../providedFilterUtils';
import { DateCompWrapper } from './dateCompWrapper';
import type { DateFilter } from './dateFilter';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

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
    private readonly eReadOnlyText: GridInputTextField = RefPlaceholder;
    private readonly eDateWrapper: HTMLInputElement = RefPlaceholder;

    private dateComp: DateCompWrapper;
    private refreshValueTooltip?: () => void;
    private editable = false;
    protected readonly filterType = 'date';
    protected readonly defaultOptions = DEFAULT_DATE_FILTER_OPTIONS;

    constructor() {
        super(DateFloatingFilterElement, [AgInputTextFieldSelector]);
    }

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: IDateFilterParams,
        column: Column
    ): DateFilterModelFormatter {
        return new DateFilterModelFormatter(optionsFactory, filterParams, column);
    }

    protected override setParams(params: IFloatingFilterParams<DateFilter>): void {
        super.setParams(params);

        this.createDateComponent();
        const translate = this.getLocaleTextFunc();
        this.eReadOnlyText.setDisabled(true).setInputAriaLabel(translate('ariaDateFilterInput', 'Date Filter Input'));
        this.refreshValueTooltip = _addFloatingFilterValueTooltip(
            this,
            this.beans,
            () => this.params.column,
            () => (this.editable ? this.eDateWrapper.querySelector('input') : this.eReadOnlyText.getInputElement())
        );
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
        this.refreshValueTooltip?.();
    }

    protected refreshAriaLabel(): void {
        this.dateComp.setInputAriaLabel(this.getAriaLabel(this.params.column as AgColumn));
    }

    protected setEditable(editable: boolean): void {
        this.editable = editable;
        _setDisplayed(this.eDateWrapper, editable);
        _setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }

    protected onModelUpdated(model: ISimpleFilterModel): void {
        super.setLastTypeFromModel(model);
        this.updateCompOnModelChange(model);
    }

    private onDateChanged(): void {
        this.refreshValueTooltip?.();
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
        const debounceMs = getDebounceMs(this.beans.log, filterParams as IDateFilterParams, this.defaultDebounceMs);
        const debouncedDateChanged = _debounce(this, this.onDateChanged.bind(this), debounceMs);
        let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
        return _addGridCommonParams(this.gos, {
            onDateChanged: () => {
                debounceTimeout = debouncedDateChanged();
            },
            onDateCleared: _isUseApplyButton(filterParams as IDateFilterParams)
                ? undefined
                : () => {
                      clearTimeout(debounceTimeout);
                      this.onDateChanged();
                  },
            filterParams,
            location: 'floatingFilter',
        });
    }

    private createDateComponent(): void {
        const {
            beans: { context, userCompFactory },
            eDateWrapper,
            params: { column },
        } = this;
        this.dateComp = new DateCompWrapper(
            context,
            userCompFactory,
            column.getColDef(),
            this.getDateComponentParams(),
            eDateWrapper,
            (dateComp) => {
                dateComp.setInputAriaLabel(this.getAriaLabel(column as AgColumn));
                this.refreshValueTooltip?.();
            }
        );

        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}

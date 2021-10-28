import { RefSelector } from '../../../widgets/componentAnnotations';
import { AgPromise } from '../../../utils';
import { SimpleFilter, ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { makeNull } from '../../../utils/generic';
import { setDisplayed } from '../../../utils/dom';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isBrowserChrome, isBrowserEdge } from '../../../utils/browser';

export interface NumberFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'number'` */
    filterType?: 'number';
    /**
     * The number value(s) associated with the filter.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to).
     */
    filter?: number | null;
    /**
     * Range filter `to` value.
     */
    filterTo?: number | null;
}

export interface INumberFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text` instead of `number`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match, in supported browsers (all except Safari).
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     */
    numberParser?: (text: string | null) => number;
}

export class NumberFilter extends ScalarFilter<NumberFilterModel, number> {
    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.LESS_THAN,
        ScalarFilter.LESS_THAN_OR_EQUAL,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.GREATER_THAN_OR_EQUAL,
        ScalarFilter.IN_RANGE
    ];

    @RefSelector('eValueFrom1') private readonly eValueFrom1: AgInputTextField;
    @RefSelector('eValueTo1') private readonly eValueTo1: AgInputTextField;

    @RefSelector('eValueFrom2') private readonly eValueFrom2: AgInputTextField;
    @RefSelector('eValueTo2') private readonly eValueTo2: AgInputTextField;

    private numberFilterParams: INumberFilterParams;

    constructor() {
        super('numberFilter');
    }

    protected mapRangeFromModel(filterModel: NumberFilterModel): { from: number | null | undefined, to: number | null | undefined; } {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            const fields = [this.eValueFrom1, this.eValueFrom2, this.eValueTo1, this.eValueTo2];

            fields.forEach(field => {
                field.setValue(null, silent);
                field.setDisabled(this.isReadOnly());
            });

            this.resetPlaceholder();
        });
    }

    protected setConditionIntoUi(model: NumberFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;
        const eValueFrom = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;

        eValueFrom.setValue(model ? ('' + model.filter) : null);
        eValueTo.setValue(model ? ('' + model.filterTo) : null);
    }

    protected setValueFromFloatingFilter(value: string): void {
        this.eValueFrom1.setValue(value);
        this.eValueTo1.setValue(null);
        this.eValueFrom2.setValue(null);
        this.eValueTo2.setValue(null);
    }

    protected comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) { return 0; }

            return left < right ? 1 : -1;
        };
    }

    protected setParams(params: INumberFilterParams): void {
        this.numberFilterParams = params;

        const allowedCharPattern = this.getAllowedCharPattern();

        if (allowedCharPattern) {
            const config = { allowedCharPattern };

            this.resetTemplate({
                eValueFrom1: config,
                eValueTo1: config,
                eValueFrom2: config,
                eValueTo2: config,
            });
        }

        super.setParams(params);

        this.addValueChangedListeners();
    }

    private addValueChangedListeners(): void {
        if (this.isReadOnly()) {
            return;
        }

        const listener = () => this.onUiChanged();

        this.eValueFrom1.onValueChange(listener);
        this.eValueTo1.onValueChange(listener);
        this.eValueFrom2.onValueChange(listener);
        this.eValueTo2.onValueChange(listener);
    }

    private resetPlaceholder(): void {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const isRange1 = this.showValueTo(this.getCondition1Type());
        const isRange2 = this.showValueTo(this.getCondition2Type());

        this.eValueFrom1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom1.setInputAriaLabel(
            isRange1
                ? globalTranslate('ariaFilterFromValue', 'Filter from value')
                : globalTranslate('ariaFilterValue', 'Filter Value')
        );

        this.eValueTo1.setInputPlaceholder(this.translate('inRangeEnd'));
        this.eValueTo1.setInputAriaLabel(globalTranslate('ariaFilterToValue', 'Filter to Value'));

        this.eValueFrom2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom2.setInputAriaLabel(
            isRange2
                ? globalTranslate('ariaFilterFromValue', 'Filter from value')
                : globalTranslate('ariaFilterValue', 'Filter Value')
        );

        this.eValueTo2.setInputPlaceholder(this.translate('inRangeEnd'));
        this.eValueTo2.setInputAriaLabel(globalTranslate('ariaFilterToValue', 'Filter to Value'));
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.resetPlaceholder();

        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            this.eValueFrom1.getInputElement().focus();
        }
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';
        const allowedCharPattern = this.getAllowedCharPattern();
        const agElementTag = allowedCharPattern ? 'ag-input-text-field' : 'ag-input-number-field';

        return /* html */`
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <${agElementTag} class="ag-filter-from ag-filter-filter" ref="eValueFrom${pos}"></${agElementTag}>
                <${agElementTag} class="ag-filter-to ag-filter-filter" ref="eValueTo${pos}"></${agElementTag}>
            </div>`;
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;
        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();

        if (option === SimpleFilter.EMPTY) { return false; }

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        const eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        const value = this.stringToFloat(eValue.getValue());

        return value != null && (!this.showValueTo(option) || this.stringToFloat(eValueTo.getValue()) != null);
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    }

    protected getFilterType(): 'number' {
        return 'number';
    }

    private stringToFloat(value?: string | number | null): number | null {
        if (typeof value === 'number') {
            return value;
        }

        let filterText = makeNull(value);

        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }

        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }

        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    }

    protected createCondition(position: ConditionPosition): NumberFilterModel {
        const positionOne = position === ConditionPosition.One;
        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const value = this.stringToFloat(eValue.getValue());

        const model: NumberFilterModel = {
            filterType: this.getFilterType(),
            type
        };

        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;

            if (this.showValueTo(type)) {
                const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
                const valueTo = this.stringToFloat(eValueTo.getValue());

                model.filterTo = valueTo;
            }
        }

        return model;
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        this.resetPlaceholder();

        const condition1Type = this.getCondition1Type();
        const condition2Type = this.getCondition2Type();

        setDisplayed(this.eValueFrom1.getGui(), this.showValueFrom(condition1Type));
        setDisplayed(this.eValueTo1.getGui(), this.showValueTo(condition1Type));
        setDisplayed(this.eValueFrom2.getGui(), this.showValueFrom(condition2Type));
        setDisplayed(this.eValueTo2.getGui(), this.showValueTo(condition2Type));
    }

    private getAllowedCharPattern(): string | null {
        const { allowedCharPattern } = this.numberFilterParams || {};

        if (allowedCharPattern) {
            return allowedCharPattern;
        }

        if (!isBrowserChrome() && !isBrowserEdge()) {
            // only Chrome and Edge support the HTML5 number field, so for other browsers we provide an equivalent
            // constraint instead
            return '\\d\\-\\.';
        }

        return null;
    }
}

import { RefSelector } from '../../../widgets/componentAnnotations';
import { Promise } from '../../../utils';
import { SimpleFilter, ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { makeNull } from '../../../utils/generic';
import { setDisplayed } from '../../../utils/dom';
import { AgInputTextField } from '../../../widgets/agInputTextField';

export interface NumberFilterModel extends ISimpleFilterModel {
    filter?: number;
    filterTo?: number;
}

export interface INumberFilterParams extends IScalarFilterParams {
    allowedCharPattern?: string;
    numberParser?: (text: string) => number;
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

    @RefSelector('eValueFrom1') private eValueFrom1: AgInputTextField;
    @RefSelector('eValueTo1') private eValueTo1: AgInputTextField;

    @RefSelector('eValueFrom2') private eValueFrom2: AgInputTextField;
    @RefSelector('eValueTo2') private eValueTo2: AgInputTextField;

    private numberFilterParams: INumberFilterParams;

    constructor() {
        super('numberFilter');
    }

    protected mapRangeFromModel(filterModel: NumberFilterModel): { from: number, to: number; } {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            const fields = [this.eValueFrom1, this.eValueFrom2, this.eValueTo1, this.eValueTo2];

            fields.forEach(field => field.setValue(null, silent));

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

        const { allowedCharPattern } = params;

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
        const listener = () => this.onUiChanged();

        this.eValueFrom1.onValueChange(listener);
        this.eValueTo1.onValueChange(listener);
        this.eValueFrom2.onValueChange(listener);
        this.eValueTo2.onValueChange(listener);
    }

    private resetPlaceholder(): void {
        const isRange1 = this.showValueTo(this.getCondition1Type());
        const isRange2 = this.showValueTo(this.getCondition2Type());

        this.eValueFrom1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom1.setInputAriaLabel(this.translate(isRange1 ? 'inRangeStart' : 'filterOoo'));

        this.eValueTo1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeEnd' : 'filterOoo'));
        this.eValueTo1.setInputAriaLabel(this.translate(isRange1 ? 'inRangeEnd' : 'filterOoo'));

        this.eValueFrom2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom2.setInputAriaLabel(this.translate(isRange2 ? 'inRangeStart' : 'filterOoo'));

        this.eValueTo2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeEnd' : 'filterOoo'));
        this.eValueTo2.setInputAriaLabel(this.translate(isRange2 ? 'inRangeEnd' : 'filterOoo'));
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.resetPlaceholder();
        this.eValueFrom1.getInputElement().focus();
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';
        const { allowedCharPattern } = this.numberFilterParams || {};
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

    protected getFilterType(): string {
        return 'number';
    }

    private stringToFloat(value: string | number): number {
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

        return filterText == null ? null : parseFloat(filterText);
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
}

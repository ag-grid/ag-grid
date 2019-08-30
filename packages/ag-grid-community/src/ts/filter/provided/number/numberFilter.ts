import { RefSelector } from "../../../widgets/componentAnnotations";
import { _ } from "../../../utils";

import {
    SimpleFilter,
    ConditionPosition,
    ISimpleFilterModel
} from "../simpleFilter";
import { ScalerFilter, Comparator, IScalarFilterParams } from "../scalerFilter";

export interface NumberFilterModel extends ISimpleFilterModel {
    filter?: number;
    filterTo?: number;
}

export interface INumberFilterParams extends IScalarFilterParams {
}

export class NumberFilter extends ScalerFilter<NumberFilterModel, number> {

    private static readonly FILTER_TYPE = 'number';

    public static DEFAULT_FILTER_OPTIONS = [ScalerFilter.EQUALS, ScalerFilter.NOT_EQUAL,
        ScalerFilter.LESS_THAN, ScalerFilter.LESS_THAN_OR_EQUAL,
        ScalerFilter.GREATER_THAN, ScalerFilter.GREATER_THAN_OR_EQUAL,
        ScalerFilter.IN_RANGE];

    @RefSelector('eValueFrom1')
    private eValueFrom1: HTMLInputElement;
    @RefSelector('eValueFrom2')
    private eValueFrom2: HTMLInputElement;

    @RefSelector('eValueTo1')
    private eValueTo1: HTMLInputElement;
    @RefSelector('eValueTo2')
    private eValueTo2: HTMLInputElement;

    protected mapRangeFromModel(filterModel: NumberFilterModel): {from: number, to: number} {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    protected resetUiToDefaults(): void {
        super.resetUiToDefaults();

        this.eValueFrom1.value = null;
        this.eValueFrom2.value = null;
        this.eValueTo1.value = null;
        this.eValueTo2.value = null;
    }

    protected setConditionIntoUi(model: NumberFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;

        const eValueFrom = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;

        eValueFrom.value = model ? ('' + model.filter) : null;
        eValueTo.value = model ? ('' + model.filterTo) : null;
    }

    protected setValueFromFloatingFilter(value: string): void {
        this.eValueFrom1.value = value;
        this.eValueFrom2.value = null;
        this.eValueTo1.value = null;
        this.eValueTo2.value = null;
    }

    protected comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) { return 0; }
            if (left < right) { return 1; }
            if (left > right) { return -1; }
        };
    }

    protected setParams(params: INumberFilterParams): void {
        super.setParams(params);

        this.addValueChangedListeners();
    }

    private addValueChangedListeners(): void {
        const listener = () => this.onUiChanged();
        this.addDestroyableEventListener(this.eValueFrom1, 'input', listener);
        this.addDestroyableEventListener(this.eValueFrom2, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo1, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo2, 'input', listener);
    }

    public afterGuiAttached() {
        this.eValueFrom1.focus();
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {

        const positionOne = position === ConditionPosition.One;

        const pos = positionOne ? '1' : '2';

        const translate = this.translate.bind(this);

        return `<div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
            <div class="ag-input-wrapper" role="presentation">
                <input class="ag-filter-filter" ref="eValueFrom${pos}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
             <div class="ag-input-wrapper ag-filter-number-to" ref="ePanel${pos}" role="presentation">
                <input class="ag-filter-filter" ref="eValueTo${pos}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
        </div>`;
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;

        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;

        const value = this.stringToFloat(eValue.value);
        const valueTo = this.stringToFloat(eValueTo.value);

        if (option === SimpleFilter.EMPTY) { return false; }

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        if (option === SimpleFilter.IN_RANGE) {
            return value != null && valueTo != null;
        } else {
            return value != null;
        }
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    }

    // needed for creating filter model
    protected getFilterType(): string {
        return NumberFilter.FILTER_TYPE;
    }

    private stringToFloat(value: string): number {
        let filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        let newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }

    protected createCondition(position: ConditionPosition): NumberFilterModel {
        const positionOne = position === ConditionPosition.One;

        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();

        const eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        const value = this.stringToFloat(eValue.value);

        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        const valueTo = this.stringToFloat(eValueTo.value);

        const model: NumberFilterModel =  {
            filterType: NumberFilter.FILTER_TYPE,
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
            model.filterTo = valueTo; // FIX - should only populate this when filter choice has 'to' option
        }
        return model;

    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        const showFrom1 = this.showValueFrom(this.getCondition1Type());
        _.setDisplayed(this.eValueFrom1, showFrom1);

        const showTo1 = this.showValueTo(this.getCondition1Type());
        _.setDisplayed(this.eValueTo1, showTo1);

        const showFrom2 = this.showValueFrom(this.getCondition2Type());
        _.setDisplayed(this.eValueFrom2, showFrom2);

        const showTo2 = this.showValueTo(this.getCondition2Type());
        _.setDisplayed(this.eValueTo2, showTo2);
    }

}
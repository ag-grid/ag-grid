import {
    AbstractSimpleFilter,
    FilterPosition,
    IAbstractSimpleFilterParams,
    IAbstractSimpleModel, ICombinedSimpleModel
} from "../abstractSimpleFilter";
import {FilterModel} from "../../../interfaces/iFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {AbstractComparableFilter} from "../abstractComparableFilter";
import {_} from "../../../utils";
import {AbstractScalerFilter2} from "../abstractScalerFilter2";
import {Comparator} from "../abstractFilter";
import {TextFilterModel2} from "../text/textFilter2";

export interface NumberFilter2Model extends IAbstractSimpleModel {
    filter?: number;
    filterTo?: number;
}

export interface INumberFilterParams2 extends IAbstractSimpleFilterParams {
}

export class NumberFilter2 extends AbstractScalerFilter2<NumberFilter2Model, number> {

    private static readonly FILTER_TYPE = 'number';

    @RefSelector('eValue1')
    private eValue1: HTMLInputElement;
    @RefSelector('eValue2')
    private eValue2: HTMLInputElement;

    @RefSelector('eValueTo1')
    private eValueTo1: HTMLInputElement;
    @RefSelector('eValueTo2')
    private eValueTo2: HTMLInputElement;

    protected mapRangeFromModel(filterModel: NumberFilter2Model): {from: number, to: number} {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    }

    protected resetUiToDefaults(): void {
        super.resetUiToDefaults();

        this.eValue1.value = null;
        this.eValue2.value = null;
        this.eValueTo1.value = null;
        this.eValueTo2.value = null;
    }

    protected setConditionIntoUi(model: NumberFilter2Model, position: FilterPosition): void {
        const positionOne = position===FilterPosition.One;

        const eValueFrom = positionOne ? this.eValue1 : this.eValue2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;

        eValueFrom.value = model ? (''+model.filter) : null;
        eValueTo.value = model ? (''+model.filterTo) : null;
    }

    protected comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) { return 0; }
            if (left < right) { return 1; }
            if (left > right) { return -1; }
        };
    }

    protected setParams(params: INumberFilterParams2): void {
        super.setParams(params);

        this.addValueChangedListeners();
    }

    private addValueChangedListeners(): void {
        const listener = this.onUiChangedListener.bind(this);
        this.addDestroyableEventListener(this.eValue1, 'input', listener);
        this.addDestroyableEventListener(this.eValue2, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo1, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo2, 'input', listener);
    }

    public afterGuiAttached() {
        this.eValue1.focus();
    }

    protected modelFromFloatingFilter(from: string): FilterModel {
        return null;
    }

    protected getDefaultFilterOptions(): string[] {
        return [AbstractComparableFilter.EQUALS, AbstractComparableFilter.NOT_EQUAL, AbstractComparableFilter.LESS_THAN,
            AbstractComparableFilter.LESS_THAN_OR_EQUAL, AbstractComparableFilter.GREATER_THAN,
            AbstractComparableFilter.GREATER_THAN_OR_EQUAL, AbstractComparableFilter.IN_RANGE];
    }

    protected createValueTemplate(position: FilterPosition): string {

        const positionOne = position===FilterPosition.One;

        const pos = positionOne ? '1' : '2';

        const translate = this.translate.bind(this);

        return `<div class="ag-filter-body" ref="eCondition${pos}Body">
            <div class="ag-input-text-wrapper">
                <input class="ag-filter-filter" ref="eValue${pos}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
             <div class="ag-input-text-wrapper ag-filter-number-to" ref="ePanel${pos}">
                <input class="ag-filter-filter" ref="eValueTo${pos}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
        </div>`;
    }

    protected isFilterUiComplete(position: FilterPosition): boolean {
        const positionOne = position===FilterPosition.One;

        const option = positionOne ? this.getType1() : this.getType2();
        const eValue = positionOne ? this.eValue1 : this.eValue2;
        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;

        const value = this.stringToFloat(eValue.value);
        const valueTo = this.stringToFloat(eValueTo.value);

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        if (option===AbstractSimpleFilter.IN_RANGE) {
            return value != null && valueTo != null;
        } else {
            return value != null;
        }
    }

    protected areSimpleModelsEqual(aSimple: NumberFilter2Model, bSimple: NumberFilter2Model): boolean {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    }

    // needed for creating filter model
    protected getFilterType(): string {
        return NumberFilter2.FILTER_TYPE;
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

    protected createCondition(position: FilterPosition): NumberFilter2Model {
        const positionOne = position===FilterPosition.One;

        const type = positionOne ? this.getType1() : this.getType2();

        const eValue = positionOne ? this.eValue1 : this.eValue2;
        const value = this.stringToFloat(eValue.value);

        const eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        const valueTo = this.stringToFloat(eValueTo.value);

        const model: NumberFilter2Model =  {
            filterType: NumberFilter2.FILTER_TYPE,
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

        const show = (type: string, eValue: HTMLElement, eValueTo: HTMLElement) => {
            const showValue = !this.doesFilterHaveHiddenInput(type) && type !== AbstractSimpleFilter.EMPTY;
            _.setVisible(eValue, showValue);
            const showValueTo = type === AbstractSimpleFilter.IN_RANGE;
            _.setVisible(eValueTo, showValueTo);
        };

        show(this.getType1(), this.eValue1, this.eValueTo1);
        show(this.getType2(), this.eValue2, this.eValueTo2);
    }


}
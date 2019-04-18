import {IDoesFilterPassParams} from "../../../interfaces/iFilter";
import {FilterConditionType} from "../abstractFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {_} from "../../../utils";
import {AbstractABFilter, IABFilterParams, ABFilterModel} from "../abstractABFilter";

export interface TextFilterModel2 extends ABFilterModel {
    filterValueA: string;
    filterValueB?: string;
}

export interface TextComparator2 {
    (filter: string, gridValue: any, filterText: string): boolean;
}

export interface TextFormatter2 {
    (from: string): string;
}

export interface ITextFilterParams2 extends IABFilterParams {
    textCustomComparator?: TextComparator2;
    debounceMs?: number;
    caseSensitive?: boolean;
}

export class TextFilter2 extends AbstractABFilter <string, ITextFilterParams2, TextFilterModel2> {

    private static readonly FILTER_TYPE = 'text';

    @RefSelector('eFilterTextA')
    private eFilterValueA: HTMLInputElement;

    @RefSelector('eFilterTextB')
    private eFilterValueB: HTMLInputElement;

    private appliedValueA: string;
    private appliedValueB: string;

    private comparator: TextComparator2;
    private formatter: TextFormatter2;

    static DEFAULT_FORMATTER: TextFormatter2 = (from: string) => {
        return from;
    };

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter2 = (from: string) => {
        if (from == null) { return null; }
        return from.toString().toLowerCase();
    };

    static DEFAULT_COMPARATOR: TextComparator2 = (filter: string, value: any, filterText: string) => {
        switch (filter) {
            case TextFilter2.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter2.NOT_CONTAINS:
                return value.indexOf(filterText) === -1;
            case TextFilter2.EQUALS:
                return value === filterText;
            case TextFilter2.NOT_EQUAL:
                return value != filterText;
            case TextFilter2.STARTS_WITH:
                return value.indexOf(filterText) === 0;
            case TextFilter2.ENDS_WITH:
                const index = value.lastIndexOf(filterText);
                return index >= 0 && index === (value.length - filterText.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + filter);
                return false;
        }
    };

    private getValue(element: HTMLInputElement): string {
        let val = element.value;
        val = _.makeNull(val);
        if (val && val.trim() === '') {
            val = null;
        }
        if (val && !this.filterParams.caseSensitive) {
            val = val.toLowerCase();
        }
        return val;
    }

    protected doApply(): void {
        super.doApply();

        this.appliedValueA = this.getValue(this.eFilterValueA);
        this.appliedValueB = this.getValue(this.eFilterValueB);
    }

    protected addFilterValueChangedListeners(): void {
        const debounceMs = this.getDebounceMs(this.filterParams);

        const toDebounce: () => void = _.debounce(() => this.onFilterChanged(), debounceMs);

        this.addDestroyableEventListener(this.eFilterValueA, 'input', toDebounce);
        this.addDestroyableEventListener(this.eFilterValueB, 'input', toDebounce);
    }

    public getDefaultFilterOption(): string {
        return AbstractABFilter.CONTAINS;
    }

    public init(params: ITextFilterParams2): void {
        super.init(params);

        this.comparator = this.filterParams.textCustomComparator ? this.filterParams.textCustomComparator : TextFilter2.DEFAULT_COMPARATOR;
        this.formatter =
            this.filterParams.textFormatter ? this.filterParams.textFormatter :
                this.filterParams.caseSensitive == true ? TextFilter2.DEFAULT_FORMATTER :
                    TextFilter2.DEFAULT_LOWERCASE_FORMATTER;

        this.addFilterValueChangedListeners();
    }

    public getNullableModel(): TextFilterModel2 {
        const model: TextFilterModel2 = {
            filterType: TextFilter2.FILTER_TYPE,
            filterOptionA: this.getAppliedOptionA(),
            filterValueA: this.appliedValueA
        };

        if (this.isAllowTwoConditions() && this.appliedValueA && this.appliedValueB) {
            model.join = this.getAppliedJoin();
            model.filterValueB = this.appliedValueB;
            model.filterOptionB = this.getAppliedOptionB();
        }

        return model;
    }

    public setModel(modelMightBeDeprecated: TextFilterModel2): void {
        const model = this.convertDeprecatedModelType(modelMightBeDeprecated);

        if (!model) {
            this.reset();
            return;
        }

        super.setModel(model);

        this.appliedValueA = this.formatter(model.filterValueA);
        this.eFilterValueA.value = model.filterValueA;

        if (model.join) {
            this.appliedValueB = this.formatter(model.filterValueB);
            this.eFilterValueB.value = model.filterValueB;
        } else {
            this.appliedValueB = null;
            this.eFilterValueB.value = null;
        }
    }

    protected reset(): void {
        super.reset();

        this.appliedValueA = null;
        this.eFilterValueA.value = null;
        this.appliedValueB = null;
        this.eFilterValueB.value = null;
    }

    // for backwards compatibility after Niall's refactor Q2 2019
    private convertDeprecatedModelType(model: TextFilterModel2): TextFilterModel2 {
        if (!model) { return model; }

        const modelAsAny = <any> model;

        const deprecatedModelTwoConditions = modelAsAny.condition1 && modelAsAny.condition2;
        const deprecatedModelOneCondition = modelAsAny.type && modelAsAny.filter;

        // converts the old type where A and B were in different embedded objects
        if (deprecatedModelTwoConditions) {
            return {
                filterType: model.filterType,
                filterOptionA: modelAsAny.condition1.type,
                filterValueA: modelAsAny.condition1.filter,
                filterOptionB: modelAsAny.condition2.type,
                filterValueB: modelAsAny.condition2.filter,
                join: modelAsAny.condition
            };
        } else if (deprecatedModelOneCondition) {
            return {
                filterType: model.filterType,
                filterOptionA: modelAsAny.type,
                filterValueA: modelAsAny.filter
            };
        } else {
            // no conversion needed
            return model;
        }
    }

    public modelFromFloatingFilter(from: string): TextFilterModel2 {
        return {
            filterType: TextFilter2.FILTER_TYPE,
            filterOptionA: this.appliedOptionA,
            filterValueA: from
        };
    }

    public getDefaultFilterOptions(): string[] {
        return [AbstractABFilter.EQUALS, AbstractABFilter.NOT_EQUAL, AbstractABFilter.STARTS_WITH,
            AbstractABFilter.ENDS_WITH, AbstractABFilter.CONTAINS, AbstractABFilter.NOT_CONTAINS];
    }

    public createValueTemplate(old:FilterConditionType): string {

        const position = old===FilterConditionType.MAIN ? 'A' : 'B';
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div class="ag-filter-body" ref="eBody${position}">
            <div class="ag-input-text-wrapper">
                <input class="ag-filter-filter" ref="eFilterText${position}" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
            </div>
        </div>`;
    }

    protected updateVisibilityOfComponents(): void {
        super.updateVisibilityOfComponents();
        
        const showA = !this.doesFilterHaveHiddenInput(this.appliedOptionA) && this.appliedOptionA !== AbstractABFilter.EMPTY;
        _.setVisible(this.eFilterValueA, showA);

        const showB = !this.doesFilterHaveHiddenInput(this.appliedOptionB) && this.appliedOptionB !== AbstractABFilter.EMPTY;
        _.setVisible(this.eFilterValueB, showB);
    }

    public afterGuiAttached() {
        this.eFilterValueA.focus();
    }

    public getFilterValueA(): string {
        return this.appliedValueA;
    }

    protected isFirstFilterGuiComplete(): boolean {
        if (this.doesFilterHaveHiddenInput(this.appliedOptionA)) {
            return true;
        }
        const firstFilterValue = this.getValue(this.eFilterValueA);
        return firstFilterValue != null;
    }

    public individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean {
        const filterText:string = type == FilterConditionType.MAIN ? this.appliedValueA : this.appliedValueB;
        const filterOption:string = type == FilterConditionType.MAIN ? this.getAppliedOptionA() : this.getAppliedOptionB();

        const customFilterOption = this.optionsFactory.getCustomOption(filterOption);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterText != null || customFilterOption.hideFilterInput) {
                const cellValue = this.filterParams.valueGetter(params.node);
                const formattedCellValue: string = this.formatter(cellValue);
                return customFilterOption.test(filterText, formattedCellValue);
            }
        }

        if (!filterText) {
            return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        } else {
            return this.checkIndividualFilter(params, filterOption, filterText);
        }
    }

    private checkIndividualFilter(params: IDoesFilterPassParams, filterOption:string, filterText: string) {
        const cellValue = this.filterParams.valueGetter(params.node);
        const filterTextFormatted = this.formatter(filterText);

        if (cellValue == null || cellValue === undefined) {
            return filterOption === AbstractABFilter.NOT_EQUAL || filterOption === AbstractABFilter.NOT_CONTAINS;
        }

        const valueFormatted: string = this.formatter(cellValue);
        return this.comparator (filterOption, valueFormatted, filterTextFormatted);
    }

/*
    private onFilterValueChanged(type:FilterConditionType) {

        let newValue = type === FilterConditionType.MAIN ? this.eFilterValueA.value : this.eFilterValueB.value;
        const lastValue = type === FilterConditionType.MAIN ? this.filterValueA : this.filterValueB;

        newValue = _.makeNull(newValue);
        if (newValue && newValue.trim() === '') {
            newValue = null;
        }

        if (lastValue !== newValue) {
            const newLowerCase =
                newValue && this.filterParams.caseSensitive != true ? newValue.toLowerCase() :
                    newValue;
            const previousLowerCase = lastValue && this.filterParams.caseSensitive != true  ? lastValue.toLowerCase() :
                lastValue;

            if (type === FilterConditionType.MAIN) {
                this.filterValueA = this.formatter(newValue);

            } else {
                this.filterValueB = this.formatter(newValue);
            }
            if (previousLowerCase !== newLowerCase) {
                this.onFilterChanged();
            }
        }
    }
*/

    public setFilter(filter: string, type:FilterConditionType): void {
    }

    public getFilter(): string {
        return this.appliedValueA;
    }

    public resetState(resetConditionFilterOnly: boolean = false): void {
/*
        if (!resetConditionFilterOnly) {
            this.setFilterType(this.optionsFactory.getDefaultOption(), FilterConditionType.MAIN);
            this.setFilter(null, FilterConditionType.MAIN);
        }

        this.setFilterType(this.optionsFactory.getDefaultOption(), FilterConditionType.CONDITION);
        this.setFilter(null, FilterConditionType.CONDITION);
*/
    }

    public serialize(type:FilterConditionType): TextFilterModel2 { return null; }

    public parse(model: TextFilterModel2, type:FilterConditionType): void {}

    public setType(filterType: string, type:FilterConditionType): void {}
}
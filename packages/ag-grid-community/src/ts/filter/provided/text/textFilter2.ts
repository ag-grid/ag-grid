import {IDoesFilterPassParams} from "../../../interfaces/iFilter";
import {FilterConditionType} from "../abstractFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {_} from "../../../utils";
import {AbstractABFilter, IABFilterParams, ABFilterModel} from "../abstractABFilter";

export interface TextFilterModel2 extends ABFilterModel {
    filterValueA?: string;
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
    caseSensitive?: boolean;
}

export class TextFilter2 extends AbstractABFilter {

    private static readonly FILTER_TYPE = 'text';

    @RefSelector('eFilterTextA')
    private eFilterValueA: HTMLInputElement;

    @RefSelector('eFilterTextB')
    private eFilterValueB: HTMLInputElement;

    private comparator: TextComparator2;
    private formatter: TextFormatter2;

    private textFilterParams: ITextFilterParams2;

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
        if (val && !this.textFilterParams.caseSensitive) {
            val = val.toLowerCase();
        }
        return val;
    }

    protected addFilterValueChangedListeners(): void {
        this.addDestroyableEventListener(this.eFilterValueA, 'input', this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eFilterValueB, 'input', this.onFilterChanged.bind(this));
    }

    public getDefaultFilterOption(): string {
        return AbstractABFilter.CONTAINS;
    }

    public init(params: ITextFilterParams2): void {
        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator ? this.textFilterParams.textCustomComparator : TextFilter2.DEFAULT_COMPARATOR;
        this.formatter =
            this.textFilterParams.textFormatter ? this.textFilterParams.textFormatter :
                this.textFilterParams.caseSensitive == true ? TextFilter2.DEFAULT_FORMATTER :
                    TextFilter2.DEFAULT_LOWERCASE_FORMATTER;

        this.addFilterValueChangedListeners();

        super.init(params);
    }

    protected setModelIntoGui(model: TextFilterModel2): void {
        super.setModelIntoGui(model);
        this.eFilterValueA.value = model.filterValueA;
        this.eFilterValueB.value = model.filterValueB;
    }

    protected getModelFromGui(): TextFilterModel2 {
        if (!this.isFirstFilterGuiComplete()) { return null; }

        const model: TextFilterModel2 = {
            filterType: TextFilter2.FILTER_TYPE,
            filterOptionA: this.getOptionA()
        };

        const optionARequiresValue = !this.doesFilterHaveHiddenInput(model.filterOptionA);
        if (optionARequiresValue) {
            model.filterValueA = this.getValue(this.eFilterValueA);
        }

        if (this.isAllowTwoConditions()) {
            const valueB = this.getValue(this.eFilterValueB);
            const optionB = this.getOptionB();
            const optionBRequiresValue = !this.doesFilterHaveHiddenInput(optionB);
            if (!optionBRequiresValue || _.exists(valueB)) {
                model.join = this.getJoin();
                model.filterOptionB = optionB;
                if (optionBRequiresValue) {
                    model.filterValueB = valueB;
                }
            }
        }

        return model;
    }

    protected areModelsEqual(a: TextFilterModel2, b: TextFilterModel2): boolean {
        // both are missing
        if (!a && !b) { return true; }

        // one is missing, other present
        if ((!a && b) || (a && !b)) { return false; }

        // otherwise both present, so compare
        const modelsEqual =
            a.filterValueA === b.filterValueA
            && a.filterValueB === b.filterValueB
            && a.filterOptionA === b.filterOptionA
            && a.filterOptionB === b.filterOptionB
            && a.filterType === b.filterType
            && a.join === b.join;

        return modelsEqual;
    }

    protected reset(): void {
        super.reset();

        this.eFilterValueA.value = null;
        this.eFilterValueB.value = null;
    }

    // for backwards compatibility after Niall's refactor Q2 2019
    protected convertDeprecatedModelType(model: TextFilterModel2): TextFilterModel2 {
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
            filterOptionA: this.getOptionA(),
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

        const optionA = this.getOptionA();
        const showA = !this.doesFilterHaveHiddenInput(optionA) && optionA !== AbstractABFilter.EMPTY;
        _.setVisible(this.eFilterValueA, showA);

        const optionB = this.getOptionB();
        const showB = !this.doesFilterHaveHiddenInput(optionB) && optionB !== AbstractABFilter.EMPTY;
        _.setVisible(this.eFilterValueB, showB);
    }

    public afterGuiAttached() {
        this.eFilterValueA.focus();
    }

    protected isFirstFilterGuiComplete(): boolean {
        if (this.doesFilterHaveHiddenInput(this.getOptionA())) {
            return true;
        }
        const firstFilterValue = this.getValue(this.eFilterValueA);
        return firstFilterValue != null;
    }

    public individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean {
        const model = <TextFilterModel2> this.getAppliedModel();

        const filterText:string = type == FilterConditionType.MAIN ? model.filterValueA : model.filterValueB;
        const filterOption:string = type == FilterConditionType.MAIN ? model.filterOptionA : model.filterOptionB;

        const customFilterOption = this.optionsFactory.getCustomOption(filterOption);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterText != null || customFilterOption.hideFilterInput) {
                const cellValue = this.textFilterParams.valueGetter(params.node);
                const formattedCellValue: string = this.formatter(cellValue);
                return customFilterOption.test(filterText, formattedCellValue);
            }
        }

        return this.checkIndividualFilter(params, filterOption, filterText);
    }

    private checkIndividualFilter(params: IDoesFilterPassParams, filterOption:string, filterText: string): boolean {
        const cellValue = this.textFilterParams.valueGetter(params.node);
        const filterTextFormatted = this.formatter(filterText);

        if (cellValue == null || cellValue === undefined) {
            return filterOption === AbstractABFilter.NOT_EQUAL || filterOption === AbstractABFilter.NOT_CONTAINS;
        }

        const valueFormatted: string = this.formatter(cellValue);
        return this.comparator(filterOption, valueFormatted, filterTextFormatted);
    }

}
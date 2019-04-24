import {IDoesFilterPassParams} from "../../../interfaces/iFilter";
import {FilterConditionType} from "../abstractFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {_} from "../../../utils";
import {
    AbstractSimpleFilter,
    IAbstractSimpleFilterParams,
    IAbstractSimpleModel,
    ICombinedSimpleModel
} from "../abstractSimpleFilter";

export interface TextFilterModel2 extends IAbstractSimpleModel {
    filter?: string;
}

export interface TextComparator2 {
    (filter: string, gridValue: any, filterText: string): boolean;
}

export interface TextFormatter2 {
    (from: string): string;
}

export interface ITextFilterParams2 extends IAbstractSimpleFilterParams {
    textCustomComparator?: TextComparator2;
    caseSensitive?: boolean;
}

export class TextFilter2 extends AbstractSimpleFilter<TextFilterModel2> {

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
        return AbstractSimpleFilter.CONTAINS;
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

    protected setModelIntoGui(model: TextFilterModel2 | ICombinedSimpleModel<TextFilterModel2>): void {
        super.setModelIntoGui(model);

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<TextFilterModel2>> model;

            this.eFilterValueA.value = combinedModel.condition1.filter;
            this.eFilterValueB.value = combinedModel.condition2.filter;

        } else {
            const simpleModel = <TextFilterModel2> model;

            this.eFilterValueA.value = simpleModel.filter;
            this.eFilterValueB.value = null;
        }
    }

    protected getModelFromGui(): TextFilterModel2 | ICombinedSimpleModel<TextFilterModel2> {
        if (!this.isFilterGuiComplete()) { return null; }

        const createCondition = (type: string, value: string): TextFilterModel2 => {
            const model: TextFilterModel2 =  {
                filterType: TextFilter2.FILTER_TYPE,
                type: type
            };
            if (!this.doesFilterHaveHiddenInput(type)) {
                model.filter = value;
            }
            return model;
        };

        if (this.isAllowTwoConditions() && this.isFilterGuiComplete(true)) {
            const res: ICombinedSimpleModel<TextFilterModel2> = {
                filterType: TextFilter2.FILTER_TYPE,
                operator: this.getJoinOperator(),
                condition1: createCondition(this.getOptionA(), this.getValue(this.eFilterValueA)),
                condition2: createCondition(this.getOptionB(), this.getValue(this.eFilterValueB))
            };
            return res;
        } else {
            const res: TextFilterModel2 = createCondition(this.getOptionA(), this.getValue(this.eFilterValueA));
            return res;
        }
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel2, bSimple: TextFilterModel2): boolean {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    }

    protected reset(): void {
        super.reset();

        this.eFilterValueA.value = null;
        this.eFilterValueB.value = null;
    }

    public modelFromFloatingFilter(from: string): TextFilterModel2 {
        return {
            filterType: TextFilter2.FILTER_TYPE,
            type: this.getOptionA(),
            filter: from
        };
    }

    public getDefaultFilterOptions(): string[] {
        return [AbstractSimpleFilter.EQUALS, AbstractSimpleFilter.NOT_EQUAL, AbstractSimpleFilter.STARTS_WITH,
            AbstractSimpleFilter.ENDS_WITH, AbstractSimpleFilter.CONTAINS, AbstractSimpleFilter.NOT_CONTAINS];
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
        const showA = !this.doesFilterHaveHiddenInput(optionA) && optionA !== AbstractSimpleFilter.EMPTY;
        _.setVisible(this.eFilterValueA, showA);

        const optionB = this.getOptionB();
        const showB = !this.doesFilterHaveHiddenInput(optionB) && optionB !== AbstractSimpleFilter.EMPTY;
        _.setVisible(this.eFilterValueB, showB);
    }

    public afterGuiAttached() {
        this.eFilterValueA.focus();
    }

    protected isFilterGuiComplete(second = false): boolean {
        const option = second ? this.getOptionB() : this.getOptionA();
        const value = second ? this.getValue(this.eFilterValueB) : this.getValue(this.eFilterValueA);
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        return value != null;
    }

    public individualFilterPasses(params: IDoesFilterPassParams, filterModel: TextFilterModel2): boolean {

        const filterText:string =  filterModel.filter;
        const filterOption:string = filterModel.type;

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
            return filterOption === AbstractSimpleFilter.NOT_EQUAL || filterOption === AbstractSimpleFilter.NOT_CONTAINS;
        }

        const valueFormatted: string = this.formatter(cellValue);
        return this.comparator(filterOption, valueFormatted, filterTextFormatted);
    }

}
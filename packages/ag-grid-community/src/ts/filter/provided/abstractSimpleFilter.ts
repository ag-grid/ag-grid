import {FilterModel, IDoesFilterPassParams} from "../../interfaces/iFilter";
import {RefSelector} from "../../widgets/componentAnnotations";
import {FilterConditionType} from "./abstractFilter";
import {OptionsFactory} from "./optionsFactory";
import {AbstractProvidedFilter, IAbstractProvidedFilterParams} from "./abstractProvidedFilter";
import {_} from "../../utils";
import {TextFilterModel2} from "./text/textFilter2";

export interface IAbstractSimpleFilterParams extends IAbstractProvidedFilterParams {
    suppressAndOrCondition: boolean;
}

export interface IAbstractSimpleModel extends FilterModel {
    type: string;
}

export interface ICombinedSimpleModel<M extends IAbstractSimpleModel> extends FilterModel {
    operator: string;
    condition1: M;
    condition2: M;
}

const DEFAULT_TRANSLATIONS: {[name: string]: string} = {
    loadingOoo:'Loading...',
    empty: 'Choose One',
    equals:'Equals',
    notEqual:'Not equal',
    lessThan:'Less than',
    greaterThan:'Greater than',
    inRange:'In range',
    lessThanOrEqual:'Less than or equals',
    greaterThanOrEqual:'Greater than or equals',
    filterOoo:'Filter...',
    contains:'Contains',
    notContains:'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    searchOoo: 'Search...',
    selectAll: 'Select All',
    applyFilter: 'Apply Filter',
    clearFilter: 'Clear Filter',
    andCondition: 'AND',
    orCondition: 'OR'
};

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class AbstractSimpleFilter<M extends IAbstractSimpleModel> extends AbstractProvidedFilter {

    public static EMPTY = 'empty';
    public static EQUALS = 'equals';
    public static NOT_EQUAL = 'notEqual';
    public static LESS_THAN = 'lessThan';
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
    public static GREATER_THAN = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
    public static IN_RANGE = 'inRange';

    public static CONTAINS = 'contains'; //1;
    public static NOT_CONTAINS = 'notContains'; //1;
    public static STARTS_WITH = 'startsWith'; //4;
    public static ENDS_WITH = 'endsWith'; //5;

    @RefSelector('eOptionsA')
    private eOptionsA: HTMLSelectElement;

    @RefSelector('eOptionsB')
    private eOptionsB: HTMLSelectElement;

    @RefSelector('eAnd')
    private eAnd: HTMLInputElement;

    @RefSelector('eOr')
    private eOr: HTMLInputElement;

    @RefSelector('eBodyB')
    private eBodyB: HTMLElement;

    @RefSelector('eJoin')
    private eJoin: HTMLElement;

    private allowTwoConditions: boolean;

    protected optionsFactory: OptionsFactory;

    private simpleFilterParams: IAbstractSimpleFilterParams;

    protected abstract getDefaultFilterOptions(): string[];
    protected abstract getDefaultFilterOption(): string;

    protected abstract individualFilterPasses(params: IDoesFilterPassParams, type:IAbstractSimpleModel): boolean;
    protected abstract createValueTemplate(type: FilterConditionType): string;
    protected abstract isFilterGuiComplete(): boolean;
    protected abstract areSimpleModelsEqual(a: M, b: M): boolean;

    protected getOptionA(): string {
        return this.eOptionsA.value;
    }

    protected getOptionB(): string {
        return this.eOptionsB.value;
    }

    protected getJoinOperator(): string {
        return this.eOr.checked ? 'OR' : 'AND';
    }

    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean {
        // both are missing
        if (!a && !b) { return true; }

        // one is missing, other present
        if ((!a && b) || (a && !b)) { return false; }

        // one is combined, the other is not
        const aIsSimple = !(<any>a).operator;
        const bIsSimple = !(<any>b).operator;
        const oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) { return false; }

        let res: boolean;

        // otherwise both present, so compare
        if (aIsSimple) {
            const aSimple = <M> a;
            const bSimple = <M> b;

            res = this.areSimpleModelsEqual(aSimple, bSimple);
        } else {
            const aCombined = <ICombinedSimpleModel<M>> a;
            const bCombined = <ICombinedSimpleModel<M>> b;

            res = aCombined.operator === bCombined.operator
                && this.areSimpleModelsEqual(aCombined.condition1, bCombined.condition1)
                && this.areSimpleModelsEqual(aCombined.condition2, bCombined.condition2);
        }

        return res;
    }

    protected setModelIntoGui(model: IAbstractSimpleModel | ICombinedSimpleModel<M>): void {

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<M>> model;

            const orChecked = combinedModel.operator === 'OR';
            this.eAnd.checked = !orChecked;
            this.eOr.checked = orChecked;

            this.eOptionsA.value = combinedModel.condition1.type;
            this.eOptionsB.value = combinedModel.condition2.type;

        } else {
            const simpleModel = <IAbstractSimpleModel> model;

            this.eAnd.checked = true;
            this.eOr.checked = false;

            this.eOptionsA.value = simpleModel.type;
            this.eOptionsB.value = this.getDefaultFilterOption();
        }

    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const model = this.getAppliedModel();

        const isCombined = (<any>model).operator;

        if (isCombined) {
            const combinedModel = <ICombinedSimpleModel<M>> model;

            const firstResult = this.individualFilterPasses(params, combinedModel.condition1);
            const secondResult = this.individualFilterPasses(params, combinedModel.condition2);

            if (combinedModel.operator === 'AND') {
                return firstResult && secondResult;
            } else {
                return firstResult || secondResult;
            }

        } else {
            const simpleModel = <IAbstractSimpleModel> model;
            const result = this.individualFilterPasses(params, simpleModel);
            return result;
        }
    }

    public init(params: IAbstractSimpleFilterParams) {

        this.simpleFilterParams = params;

        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOption());

        this.allowTwoConditions = !params.suppressAndOrCondition;

        this.putOptionsIntoDropdown();
        this.addChangedListeners();

        super.init(params);
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.simpleFilterParams.filterOptions ?
            this.simpleFilterParams.filterOptions : this.getDefaultFilterOptions();

        filterOptions.forEach( option => {
            const createOption = ()=> {
                const key = (typeof option === 'string') ? option : option.displayKey;
                const localName = this.translate(key);

                const eOption = document.createElement("option");
                eOption.text = localName;
                eOption.value = key;

                return eOption;
            };
            this.eOptionsA.add(createOption());
            this.eOptionsB.add(createOption());
        });

        const readOnly = filterOptions.length <= 1;
        this.eOptionsA.disabled = readOnly;
        this.eOptionsB.disabled = readOnly;
    }

    public isAllowTwoConditions(): boolean {
        return this.allowTwoConditions;
    }

    protected bodyTemplate(): string {
        const optionsTemplateA = `<select class="ag-filter-select" ref="eOptionsA"></select>`;
        const valueTemplateA = this.createValueTemplate(FilterConditionType.MAIN);

        const optionsTemplateB = `<select class="ag-filter-select" ref="eOptionsB"></select>`;
        const valueTemplateB = this.createValueTemplate(FilterConditionType.CONDITION);

        const uniqueGroupId = 'ag-simple-filter-and-or-' + Math.random();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        const andOrTemplate =
            `<div class="ag-filter-condition" ref="eJoin">
                    <label>
                        <input ref="eAnd" type="radio" class="and" name="${uniqueGroupId}" value="AND")} checked="checked" />
                        ${translate('andCondition','AND')}
                    </label>
                    <label>
                        <input ref="eOr" type="radio" class="or" name="${uniqueGroupId}" value="OR" />
                        ${translate('orCondition', 'OR')}
                    </label>
                </div>`;

        const template =
               `${optionsTemplateA}
                ${valueTemplateA}
                ${andOrTemplate}
                ${optionsTemplateB}
                ${valueTemplateB}`;

        return template;
    }

    protected updateVisibilityOfComponents(): void {
        const showSecondFilter = this.isFilterGuiComplete();
        _.setVisible(this.eBodyB, showSecondFilter);
        _.setVisible(this.eOptionsB, showSecondFilter);
        _.setVisible(this.eJoin, showSecondFilter);
    }

    protected reset(): void {
        this.eAnd.checked = true;

        const defaultOption = this.getDefaultFilterOption();
        this.eOptionsA.value = defaultOption;
        this.eOptionsB.value = defaultOption;
    }

    public translate(toTranslate: string): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];

        if (!defaultTranslation && this.optionsFactory.getCustomOption(toTranslate)) {
            defaultTranslation = this.optionsFactory.getCustomOption(toTranslate).displayName;
        }

        return translate(toTranslate, defaultTranslation);
    }

    public addChangedListeners() {
        const filterChanged = this.onFilterChanged.bind(this);
        this.addDestroyableEventListener(this.eOptionsA, "change", filterChanged);
        this.addDestroyableEventListener(this.eOptionsB, "change", filterChanged);
        this.addDestroyableEventListener(this.eOr, "change", filterChanged);
        this.addDestroyableEventListener(this.eAnd, "change", filterChanged);
    }

    protected doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    }

    /*** need to verify this logic isn't needed for the other filter types. I think not, it's covered by getModel() will be  null if filter not valid. */
    /*
    public isFilterActive(): boolean {

        // the main selected filter is always active when there is no input field
        if (this.doesFilterHaveHiddenInput(this.appliedOptionA)) {
            return true;
        }

        const rawFilterValues = this.getFilterValueA();
        if (rawFilterValues && this.appliedOptionA === AbstractABFilter.IN_RANGE) {
            const filterValueArray = (rawFilterValues as T[]);
            return filterValueArray[0] != null && filterValueArray[1] != null;
        } else {
            return rawFilterValues != null;
        }
    }
    */


}

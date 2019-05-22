import { ProvidedFilterModel, IDoesFilterPassParams, IFilterOptionDef } from "../../interfaces/iFilter";
import { RefSelector } from "../../widgets/componentAnnotations";
import { OptionsFactory } from "./optionsFactory";
import { ProvidedFilter, IProvidedFilterParams } from "./providedFilter";
import { _ } from "../../utils";

export interface ISimpleFilterParams extends IProvidedFilterParams {
    filterOptions?: (IFilterOptionDef | string) [];
    defaultOption?: string;
    suppressAndOrCondition?: boolean;
}

export interface ISimpleFilterModel extends ProvidedFilterModel {
    type: string;
}

export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: string;
    condition1: M;
    condition2: M;
}

export enum ConditionPosition {One, Two}

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
export abstract class SimpleFilter<M extends ISimpleFilterModel> extends ProvidedFilter {

    public static EMPTY = 'empty';
    public static EQUALS = 'equals';
    public static NOT_EQUAL = 'notEqual';
    public static LESS_THAN = 'lessThan';
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
    public static GREATER_THAN = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
    public static IN_RANGE = 'inRange';

    public static CONTAINS = 'contains';
    public static NOT_CONTAINS = 'notContains';
    public static STARTS_WITH = 'startsWith';
    public static ENDS_WITH = 'endsWith';

    @RefSelector('eOptions1')
    private eType1: HTMLSelectElement;

    @RefSelector('eOptions2')
    private eType2: HTMLSelectElement;

    @RefSelector('eJoinOperatorAnd')
    private eJoinOperatorAnd: HTMLInputElement;

    @RefSelector('eJoinOperatorOr')
    private eJoinOperatorOr: HTMLInputElement;

    @RefSelector('eCondition2Body')
    private eCondition2Body: HTMLElement;

    @RefSelector('eJoinOperatorPanel')
    private eJoinOperatorPanel: HTMLElement;

    private allowTwoConditions: boolean;

    private simpleFilterParams: ISimpleFilterParams;

    protected optionsFactory: OptionsFactory;

    protected abstract getDefaultFilterOptions(): string[];

    // gets called once during initialisation, to build up the html template
    protected abstract createValueTemplate(position: ConditionPosition): string;

    // returns true in the row passes the said condition
    protected abstract individualConditionPasses(params: IDoesFilterPassParams, type:ISimpleFilterModel): boolean;

    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    protected abstract isConditionUiComplete(position: ConditionPosition): boolean;

    // filter uses this to know if new model is different from previous model, ie if filter has changed
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;

    // returns the type selected from the drop down. base classes use this.
    protected abstract getFilterType(): string;

    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    protected abstract setValueFromFloatingFilter(value: string): void;

    // getModel() calls this to create the two conditions. if only one condition,
    // the result is returned by getModel(), otherwise is called twice and both results
    // returned in a CombinedFilter object.
    protected abstract createCondition(position: ConditionPosition): M;

    // puts model values into the UI
    protected abstract setConditionIntoUi(model: ISimpleFilterModel, position: ConditionPosition): void;

    // returns true if this type requires a 'from' field, eg any filter that requires at least one text value
    protected showValueFrom(type: string): boolean {
        return !this.doesFilterHaveHiddenInput(type) && type !== SimpleFilter.EMPTY;
    }

    // returns true if this type requires a 'to' field, currently only 'range' returns true
    protected showValueTo(type: string): boolean {
        return type === SimpleFilter.IN_RANGE;
    }

    // floating filter calls this when user applies filter from floating filter
    public onFloatingFilterChanged(type: string, value: any): void {
        this.setValueFromFloatingFilter(value);
        this.setTypeFromFloatingFilter(type);
        this.onUiChanged(true);
    }

    protected setTypeFromFloatingFilter(type: string): void {
        this.eType1.value = type;
        this.eType2.value = null;
        this.eJoinOperatorAnd.checked = true;
    }

    protected getModelFromUi(): M | ICombinedSimpleModel<M> {
        if (!this.isConditionUiComplete(ConditionPosition.One)) { return null; }

        if (this.isAllowTwoConditions() && this.isConditionUiComplete(ConditionPosition.Two)) {
            const res: ICombinedSimpleModel<M> = {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: this.createCondition(ConditionPosition.One),
                condition2: this.createCondition(ConditionPosition.Two)
            };
            return res;
        } else {
            const res: M = this.createCondition(ConditionPosition.One);
            return res;
        }
    }

    protected getCondition1Type(): string {
        return this.eType1.value;
    }

    protected getCondition2Type(): string {
        return this.eType2.value;
    }

    protected getJoinOperator(): string {
        return this.eJoinOperatorOr.checked ? 'OR' : 'AND';
    }

    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean {
        // both are missing
        if (!a && !b) { return true; }

        // one is missing, other present
        if ((!a && b) || (a && !b)) { return false; }

        // one is combined, the other is not
        const aIsSimple = !(a as any).operator;
        const bIsSimple = !(b as any).operator;
        const oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) { return false; }

        let res: boolean;

        // otherwise both present, so compare
        if (aIsSimple) {
            const aSimple = a as M;
            const bSimple = b as M;

            res = this.areSimpleModelsEqual(aSimple, bSimple);
        } else {
            const aCombined = a as ICombinedSimpleModel<M>;
            const bCombined = b as ICombinedSimpleModel<M>;

            res = aCombined.operator === bCombined.operator
                && this.areSimpleModelsEqual(aCombined.condition1, bCombined.condition1)
                && this.areSimpleModelsEqual(aCombined.condition2, bCombined.condition2);
        }

        return res;
    }

    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): void {

        const isCombined = (model as any).operator;

        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<M>;

            const orChecked = combinedModel.operator === 'OR';
            this.eJoinOperatorAnd.checked = !orChecked;
            this.eJoinOperatorOr.checked = orChecked;

            this.eType1.value = combinedModel.condition1.type;
            this.eType2.value = combinedModel.condition2.type;

            this.setConditionIntoUi(combinedModel.condition1, ConditionPosition.One);
            this.setConditionIntoUi(combinedModel.condition2, ConditionPosition.Two);

        } else {
            const simpleModel = model as ISimpleFilterModel;

            this.eJoinOperatorAnd.checked = true;
            this.eJoinOperatorOr.checked = false;

            this.eType1.value = simpleModel.type;
            this.eType2.value = this.optionsFactory.getDefaultOption();

            this.setConditionIntoUi(simpleModel as M, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }

    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const model = this.getModel();

        const isCombined = (model as any).operator;

        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<M>;

            const firstResult = this.individualConditionPasses(params, combinedModel.condition1);
            const secondResult = this.individualConditionPasses(params, combinedModel.condition2);

            if (combinedModel.operator === 'AND') {
                return firstResult && secondResult;
            } else {
                return firstResult || secondResult;
            }

        } else {
            const simpleModel = model as ISimpleFilterModel;
            const result = this.individualConditionPasses(params, simpleModel);
            return result;
        }
    }

    protected setParams(params: ISimpleFilterParams): void {
        super.setParams(params);

        this.simpleFilterParams = params;

        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());

        this.allowTwoConditions = !params.suppressAndOrCondition;

        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.optionsFactory.getFilterOptions();

        filterOptions.forEach(option => {
            const createOption = () => {
                const key = (typeof option === 'string') ? option : option.displayKey;
                const localName = this.translate(key);

                const eOption = document.createElement(`option`);
                eOption.text = localName;
                eOption.value = key;

                return eOption;
            };
            this.eType1.add(createOption());
            this.eType2.add(createOption());
        });

        const readOnly = filterOptions.length <= 1;
        this.eType1.disabled = readOnly;
        this.eType2.disabled = readOnly;
    }

    public isAllowTwoConditions(): boolean {
        return this.allowTwoConditions;
    }

    protected createBodyTemplate(): string {
        const optionsTemplate1 = `<select class="ag-filter-select" ref="eOptions1"></select>`;
        const valueTemplate1 = this.createValueTemplate(ConditionPosition.One);

        const optionsTemplate2 = `<select class="ag-filter-select" ref="eOptions2"></select>`;
        const valueTemplate2 = this.createValueTemplate(ConditionPosition.Two);

        const uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        const andOrTemplate =
            `<div class="ag-filter-condition" ref="eJoinOperatorPanel">
                    <label>
                        <input ref="eJoinOperatorAnd" type="radio" class="and" name="${uniqueGroupId}" value="AND")} checked="checked" />
                        ${translate('andCondition', 'AND')}
                    </label>
                    <label>
                        <input ref="eJoinOperatorOr" type="radio" class="or" name="${uniqueGroupId}" value="OR" />
                        ${translate('orCondition', 'OR')}
                    </label>
                </div>`;

        const template =
               `${optionsTemplate1}
                ${valueTemplate1}
                ${andOrTemplate}
                ${optionsTemplate2}
                ${valueTemplate2}`;

        return template;
    }

    protected updateUiVisibility(): void {
        const firstConditionComplete = this.isConditionUiComplete(ConditionPosition.One);
        const showSecondFilter = this.allowTwoConditions && firstConditionComplete;
        _.setVisible(this.eCondition2Body, showSecondFilter);
        _.setVisible(this.eType2, showSecondFilter);
        _.setVisible(this.eJoinOperatorPanel, showSecondFilter);
    }

    protected resetUiToDefaults(): void {
        this.eJoinOperatorAnd.checked = true;

        const defaultOption = this.optionsFactory.getDefaultOption();
        this.eType1.value = defaultOption;
        this.eType2.value = defaultOption;
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
        const listener = () => this.onUiChanged();
        this.addDestroyableEventListener(this.eType1, "change", listener);
        this.addDestroyableEventListener(this.eType2, "change", listener);
        this.addDestroyableEventListener(this.eJoinOperatorOr, "change", listener);
        this.addDestroyableEventListener(this.eJoinOperatorAnd, "change", listener);
    }

    protected doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    }

}

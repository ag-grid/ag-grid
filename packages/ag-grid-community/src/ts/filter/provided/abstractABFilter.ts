import {FilterModel, IDoesFilterPassParams, IFilterParams} from "../../interfaces/iFilter";
import {RefSelector} from "../../widgets/componentAnnotations";
import {FilterConditionType} from "./abstractFilter";
import {OptionsFactory} from "./optionsFactory";
import {AbstractFilter2} from "./abstractFilter2";
import {_} from "../../utils";

export interface IABFilterParams extends IFilterParams {
    suppressAndOrCondition: boolean;
}

export interface ABFilterModel extends FilterModel {
    filterOptionA: string;
    filterOptionB?: string;
    join?: string;
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
export abstract class AbstractABFilter<T, P extends IABFilterParams, M extends ABFilterModel> extends AbstractFilter2<P, M> {

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

    protected appliedOptionA: string;
    protected appliedOptionB: string;
    protected appliedJoin: string;

    protected abstract getDefaultFilterOptions(): string[];
    protected abstract getDefaultFilterOption(): string;

    protected abstract getFilterValueA(): T | T[];
    protected abstract individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean;
    protected abstract createValueTemplate(type: FilterConditionType): string;
    protected abstract isFirstFilterGuiComplete(): boolean;

    protected abstract getNullableModel(): M;

    public getModel(): M {
        if (this.isFilterActive()) {
            return this.getNullableModel();
        } else {
            return null;
        }
    }

    protected getAppliedOptionA(): string {
        return this.appliedOptionA;
    }

    protected getAppliedOptionB(): string {
        return this.appliedOptionB;
    }

    protected getAppliedJoin(): string {
        return this.appliedJoin;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        const mainFilterResult = this.individualFilterPasses(params, FilterConditionType.MAIN);
        if (this.eOptionsB == null) {
            return mainFilterResult;
        }

        const auxFilterResult = this.individualFilterPasses(params, FilterConditionType.CONDITION);
        return this.conditionValue === 'AND' ? mainFilterResult && auxFilterResult : mainFilterResult || auxFilterResult;
    }

    public init(params: P) {

        this.filterParams = params;

        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOption());

        this.appliedOptionA = this.optionsFactory.getDefaultOption();
        this.appliedOptionB = this.optionsFactory.getDefaultOption();

        this.allowTwoConditions = !params.suppressAndOrCondition;

        this.putOptionsIntoDropdown();
        this.addOptionChangedListeners();
        this.reset();

        super.init(params);
    }

    private putOptionsIntoDropdown(): void {
        const filterOptions = this.filterParams.filterOptions ?
            this.filterParams.filterOptions : this.getDefaultFilterOptions();

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

    protected doApply(): void {
        this.appliedJoin = this.eOr.checked ? 'OR' : 'AND';
        this.appliedOptionA = this.eOptionsA.value;
        this.appliedOptionB = this.eOptionsB.value;
    }

    public isAllowTwoConditions(): boolean {
        return this.allowTwoConditions;
    }

    protected bodyTemplate(): string {
        const optionsTemplateA = `<select class="ag-filter-select" ref="eOptionsA"></select>`;
        const valueTemplateA = this.createValueTemplate(FilterConditionType.MAIN);

        const optionsTemplateB = `<select class="ag-filter-select" ref="eOptionsB"></select>`;
        const valueTemplateB = this.createValueTemplate(FilterConditionType.CONDITION);

        const uniqueGroupId = Math.random();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        const andOrTemplate = `<div class="ag-filter-condition" ref="eJoin">
                    <input ref="eAnd" type="radio" class="and" name="${uniqueGroupId}" value="AND")}
                           checked="checked" /><label style="display: inline" for="andId">${translate('andCondition','AND')}</label>
                    <input ref="eOr" type="radio" class="or" name="${uniqueGroupId}" value="OR" /><label style="display: inline"
                           for="orId">${translate('orCondition', 'OR')}</label>
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
        const showSecondFilter = this.isFirstFilterGuiComplete();
        _.setVisible(this.eBodyB, showSecondFilter);
        _.setVisible(this.eOptionsB, showSecondFilter);
        _.setVisible(this.eJoin, showSecondFilter);
    }

    public setModel(model: M): void {
        const orChecked = model.join === 'OR';
        this.conditionValue = orChecked ? 'OR' : 'AND';
        this.eAnd.checked = !orChecked;
        this.eOr.checked = orChecked;

        this.eOptionsA.value = model.filterOptionA;
        if (model.filterOptionB) {
            this.eOptionsB.value = model.filterOptionB;
        } else {
            this.eOptionsB.value = this.getDefaultFilterOption();
        }
    }

    protected reset(): void {
        this.conditionValue = 'AND';
        this.eAnd.checked = true;

        const defaultOption = this.getDefaultFilterOption();
        this.eOptionsA.value = defaultOption;
        this.eOptionsB.value = defaultOption;
    }

    private redrawCondition() {
/*        const filterCondition: HTMLElement = this.eFilterBodyWrapper.querySelector('.ag-filter-condition') as HTMLElement;
        if (!filterCondition && this.isFilterActive() && this.isAllowTwoConditions()) {
            this.eConditionWrapper = _.loadTemplate(this.createConditionTemplate(FilterConditionType.CONDITION));
            this.eFilterBodyWrapper.appendChild(this.eConditionWrapper);
            this.wireQuerySelectors();
            const {andButton, orButton} = this.refreshOperatorUi();

            this.addDestroyableEventListener(andButton, 'change', () => {
                this.conditionValue = 'AND';
                this.onFilterChanged();
            });
            this.addDestroyableEventListener(orButton, 'change', () => {
                this.conditionValue = 'OR';
                this.onFilterChanged();
            });
            this.initialiseFilterBodyUi(FilterConditionType.CONDITION);
        } else if (filterCondition && !this.isFilterActive()) {

            // reset condition filter state
            this.conditionValue = 'AND';
            this.resetState(true);

            this.eFilterBodyWrapper.removeChild(this.eConditionWrapper);
            this.eConditionWrapper = null;
        } else {
            this.refreshFilterBodyUi(FilterConditionType.CONDITION);
            if (this.eConditionWrapper) {
                this.refreshOperatorUi();
            }
        }*/
    }

/*    public wrapCondition(mainCondition:string): string {
        const filterNotActive = !this.isFilterActive();
        if (filterNotActive) {
            return mainCondition;
        } else {
            return  `${mainCondition}${this.createConditionTemplate(FilterConditionType.CONDITION)}`;
        }
    }*/

/*    private createConditionTemplate(type:FilterConditionType): string {

        const optionsHtml = this.createOptionsTemplate(type);

        const centerHtml = this.createValueTemplate(type);

        const template = `<div class="ag-filter-condition">
                    <input id="andId" type="radio" class="and" name="booleanLogic" value=${this.translate('AND')}
                           checked="checked" /><label style="display: inline" for="andId">${this.translate('andCondition')}</label>
                    <input id="orId" type="radio" class="or" name="booleanLogic" value="OR" /><label style="display: inline"
                           for="orId">${this.translate('orCondition')}</label>
                    <div>${optionsHtml}${centerHtml}</div>
                </div>`;

        return template;
    }*/

    public translate(toTranslate: string): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];

        if (!defaultTranslation && this.optionsFactory.getCustomOption(toTranslate)) {
            defaultTranslation = this.optionsFactory.getCustomOption(toTranslate).displayName;
        }

        return translate(toTranslate, defaultTranslation);
    }

    public addOptionChangedListeners() {
        this.addDestroyableEventListener(this.eOptionsA, "change", () => this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eOptionsB, "change", () => this.onFilterChanged.bind(this));
    }

/*    private onFilterOptionChanged(type:FilterConditionType): void {
        const prevSelectedFilter = this.appliedOptionA;

        if (type === FilterConditionType.MAIN) {
            this.appliedOptionA = this.eOptionsA.value;
        } else {
            this.appliedOptionB = this.eOptionsB.value;
        }

        this.updateVisibilityOfComponents();

        const prevSelectedFilterHadNoInput = this.doesFilterHaveHiddenInput(prevSelectedFilter);

        // only fire 'onFilterChanged' event if filter is active, as in it contains a filter value, or if the previously
        // selected filter didn't require a value, i.e. if custom filter has 'hideFilterInputField = true'
        if (this.isFilterActive() || prevSelectedFilterHadNoInput) {

            // reset when switching back to the empty filter to remove conditional filter
            if (this.appliedOptionA === AbstractABFilter.EMPTY) {
                this.resetState();
            }

            this.onFilterChanged();
        }
    }*/

    protected doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    }

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


}

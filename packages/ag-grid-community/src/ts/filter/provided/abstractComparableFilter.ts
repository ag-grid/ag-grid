import {IDoesFilterPassParams, IFilterOptionDef} from "../../interfaces/iFilter";
import {QuerySelector} from "../../widgets/componentAnnotations";
import {AbstractFilter, CombinedFilter, FilterConditionType, IComparableFilterParams} from "./abstractFilter";
import {_} from "../../utils";

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
export abstract class AbstractComparableFilter<T, P extends IComparableFilterParams, M> extends AbstractFilter<P, M> {

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

    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    @QuerySelector('#filterConditionType')
    private eTypeConditionSelector: HTMLSelectElement;

    private suppressAndOrCondition: boolean;

    private eConditionWrapper: HTMLElement;

    customFilterOptions: {[name: string]: IFilterOptionDef} = {};

    defaultFilter: string;
    selectedFilter: string;
    selectedFilterCondition: string;

    public abstract getApplicableFilterTypes(): string[];
    public abstract filterValues(type:FilterConditionType): T | T[];
    public abstract individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean;
    public abstract getDefaultType(): string;
    protected abstract generateFilterValueTemplate(type: FilterConditionType): string;

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const mainFilterResult = this.individualFilterPasses(params, FilterConditionType.MAIN);
        if (this.eTypeConditionSelector == null) {
            return mainFilterResult;
        }

        const auxFilterResult = this.individualFilterPasses(params, FilterConditionType.CONDITION);
        return this.conditionValue === 'AND' ? mainFilterResult && auxFilterResult : mainFilterResult || auxFilterResult;
    }

    public init(params: P) {

        this.filterParams = params;

        this.defaultFilter = this.filterParams.defaultOption;

        // strip out incorrectly defined FilterOptionDefs
        if (params.filterOptions) {
            params.filterOptions.forEach(filterOption => {
                if (typeof filterOption === 'string') { return; }
                if (!filterOption.displayKey) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayKey'");
                    return;
                }
                if (!filterOption.displayName) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayName'");
                    return;
                }
                if (!filterOption.test) {
                    console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'test'");
                    return;
                }

                this.customFilterOptions[filterOption.displayKey] = filterOption;
            });
        }

        if (this.filterParams.filterOptions && !this.defaultFilter) {
            const firstFilterOption = this.filterParams.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultFilter = firstFilterOption;
            } else if (firstFilterOption.displayKey) {
                this.defaultFilter = firstFilterOption.displayKey;
            } else {
                console.warn("ag-Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'");
            }
        }

        if (!this.defaultFilter) {
            this.defaultFilter = this.getDefaultType();
        }

        this.selectedFilter = this.defaultFilter;
        this.selectedFilterCondition = this.defaultFilter;

        this.suppressAndOrCondition = params.suppressAndOrCondition;

        super.init(params);
    }

    public allowTwoConditions(): boolean {
        return this.suppressAndOrCondition !== true;
    }

    protected bodyTemplate(): string {
        const optionsHtml = this.generateFilterOperatorTemplate(FilterConditionType.MAIN);
        const centerHtml = this.generateFilterValueTemplate(FilterConditionType.MAIN);
        const template = optionsHtml + centerHtml;

        const showTwoConditions = this.allowTwoConditions();

        const bodyWithTwoConditions = showTwoConditions ?
            this.wrapCondition(template) :
            template;

        return bodyWithTwoConditions;
    }

    public onFilterChanged(applyNow: boolean = false): void {
        super.onFilterChanged(applyNow);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    public setModel(model: M | CombinedFilter<M>): void {
        super.setModel(model);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    private refreshOperatorUi() {
        const andButton: HTMLInputElement = this.eConditionWrapper.querySelector('.and') as HTMLInputElement;
        const orButton: HTMLInputElement = this.eConditionWrapper.querySelector('.or') as HTMLInputElement;
        this.conditionValue = this.conditionValue == null ? 'AND' : this.conditionValue;

        andButton.checked = this.conditionValue === 'AND';
        orButton.checked = this.conditionValue === 'OR';
        return {andButton, orButton};
    }

    private redrawCondition() {
        const filterCondition: HTMLElement = this.eFilterBodyWrapper.querySelector('.ag-filter-condition') as HTMLElement;
        if (!filterCondition && this.isFilterActive() && this.allowTwoConditions()) {
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
        }
    }

    public wrapCondition(mainCondition:string): string {
        const filterNotActive = !this.isFilterActive();
        if (filterNotActive) {
            return mainCondition;
        } else {
            return  `${mainCondition}${this.createConditionTemplate(FilterConditionType.CONDITION)}`;
        }
    }

    private createConditionTemplate(type:FilterConditionType): string {

        const optionsHtml = this.generateFilterOperatorTemplate(type);
        const centerHtml = this.generateFilterValueTemplate(type);
        const template = optionsHtml + centerHtml;

        return `<div class="ag-filter-condition">
            <input id="andId" type="radio" class="and" name="booleanLogic" value=${this.translate('AND')}
                   checked="checked" /><label style="display: inline" for="andId">${this.translate('andCondition')}</label>
            <input id="orId" type="radio" class="or" name="booleanLogic" value="OR" /><label style="display: inline"
                   for="orId">${this.translate('orCondition')}</label>
            <div>${template}</div>
        </div>`;
    }

    private generateFilterOperatorTemplate(type:FilterConditionType): string {
        const defaultFilterTypes = this.getApplicableFilterTypes();
        const restrictedFilterTypes = this.filterParams.filterOptions;

        const actualFilterTypes = restrictedFilterTypes ? restrictedFilterTypes : defaultFilterTypes;

        const optionsHtml: string[] = actualFilterTypes.map(filter => {
            const filterName = (typeof filter === 'string') ? filter : filter.displayKey;
            const localeFilterName = this.translate(filterName);
            return `<option value="${filterName}">${localeFilterName}</option>`;
        });

        const readOnly = optionsHtml.length == 1 ? 'disabled' : '';
        const id:string = type == FilterConditionType.MAIN ? 'filterType' : 'filterConditionType';

        return optionsHtml.length <= 0 ?
            '' :
            `<div>
                <select class="ag-filter-select" id="${id}" ${readOnly}>
                    ${optionsHtml.join('')}
                </select>
            </div>`;
    }

    public translate(toTranslate: string): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];

        if (!defaultTranslation && this.customFilterOptions[toTranslate]) {
            defaultTranslation = this.customFilterOptions[toTranslate].displayName;
        }

        return translate(toTranslate, defaultTranslation);
    }

    public initialiseFilterBodyUi(type:FilterConditionType) {
        if (type === FilterConditionType.MAIN) {
            this.setFilterType(this.selectedFilter, type);
            this.addDestroyableEventListener(this.eTypeSelector, "change", () => this.onFilterTypeChanged (type));
        } else {
            this.setFilterType(this.selectedFilterCondition, type);
            this.addDestroyableEventListener(this.eTypeConditionSelector, "change", () => this.onFilterTypeChanged (type));
        }
    }

    private onFilterTypeChanged(type:FilterConditionType): void {
        const prevSelectedFilter = this.selectedFilter;

        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = this.eTypeSelector.value;
        } else {
            this.selectedFilterCondition = this.eTypeConditionSelector.value;
        }
        this.refreshFilterBodyUi(type);

        const prevSelectedFilterHadNoInput = this.doesFilterHaveHiddenInput(prevSelectedFilter);

        // only fire 'onFilterChanged' event if filter is active, as in it contains a filter value, or if the previously
        // selected filter didn't require a value, i.e. if custom filter has 'hideFilterInputField = true'
        if (this.isFilterActive() || prevSelectedFilterHadNoInput) {

            // reset when switching back to the empty filter to remove conditional filter
            if (this.selectedFilter === AbstractComparableFilter.EMPTY) {
                this.resetState();
            }

            this.onFilterChanged();
        }
    }

    protected doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.customFilterOptions[filterType];
        return customFilterOption && customFilterOption.hideFilterInput;
    }

    public isFilterActive(): boolean {

        // the main selected filter is always active when there is no input field
        if (this.doesFilterHaveHiddenInput(this.selectedFilter)) {
            return true;
        }

        const rawFilterValues = this.filterValues(FilterConditionType.MAIN);
        if (rawFilterValues && this.selectedFilter === AbstractComparableFilter.IN_RANGE) {
            const filterValueArray = (rawFilterValues as T[]);
            return filterValueArray[0] != null && filterValueArray[1] != null;
        } else {
            return rawFilterValues != null;
        }
    }

    public setFilterType(filterType: string, type:FilterConditionType): void {
        if (type === FilterConditionType.MAIN) {
            this.selectedFilter = filterType;

            if (!this.eTypeSelector) { return; }
            this.eTypeSelector.value = filterType;
        } else {
            this.selectedFilterCondition = filterType;

            if (!this.eTypeConditionSelector) { return; }
            this.eTypeConditionSelector.value = filterType;
        }
    }

    isFilterConditionActive(type: FilterConditionType): boolean {
        return this.filterValues(type) != null;
    }
}

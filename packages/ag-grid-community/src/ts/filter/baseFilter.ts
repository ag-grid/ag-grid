import { Component } from "../widgets/component";
import { IFilterOptionDef, IDoesFilterPassParams, IFilterComp, IFilterParams } from "../interfaces/iFilter";
import { QuerySelector } from "../widgets/componentAnnotations";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { BaseFloatingFilterChange, FloatingFilterChange } from "./floatingFilter";
import { INumberFilterParams, ITextFilterParams } from "./textFilter";
import { _ } from "../utils";

export interface Comparator<T> {
    (left: T, right: T): number;
}
export enum FilterConditionType {
    MAIN, CONDITION
}

export interface CombinedFilter <T> {
    operator: string;
    condition1: T;
    condition2: T;
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
 * T(ype) The type of this filter. ie in DateFilter T=Date
 * P(arams) The params that this filter can take
 * M(model getModel/setModel) The object that this filter serializes to
 * F Floating filter params
 *
 * Contains common logic to ALL filters.. Translation, apply and clear button
 * get/setModel context wiring....
 */
export abstract class  BaseFilter<T, P extends IFilterParams, M> extends Component implements IFilterComp {
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

    private newRowsActionKeep: boolean;

    customFilterOptions: {[name: string]: IFilterOptionDef} = {};

    filterParams: P;
    clearActive: boolean;
    applyActive: boolean;
    defaultFilter: string;
    selectedFilter: string;
    selectedFilterCondition: string;

    @QuerySelector('#applyPanel')
    private eButtonsPanel: HTMLElement;

    @QuerySelector('.ag-filter-body-wrapper')
    private eFilterBodyWrapper: HTMLElement;

    @QuerySelector('#applyButton')
    private eApplyButton: HTMLElement;

    @QuerySelector('#clearButton')
    private eClearButton: HTMLElement;

    private eConditionWrapper: HTMLElement;
    conditionValue: string;

    @Autowired('gridOptionsWrapper')
    gridOptionsWrapper: GridOptionsWrapper;

    public init(params: P): void {
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

        this.customInit();
        this.selectedFilter = this.defaultFilter;
        this.selectedFilterCondition = this.defaultFilter;
        this.clearActive = params.clearButton === true;
        //Allowing for old param property apply, even though is not advertised through the interface
        this.applyActive = ((params.applyButton === true) || ((params as any).apply === true));
        this.newRowsActionKeep = params.newRowsAction === 'keep';

        this.setTemplate(this.generateTemplate());

        _.setVisible(this.eApplyButton, this.applyActive);
        if (this.applyActive) {
            this.addDestroyableEventListener(this.eApplyButton, "click", this.filterParams.filterChangedCallback);
        }

        _.setVisible(this.eClearButton, this.clearActive);
        if (this.clearActive) {
            this.addDestroyableEventListener(this.eClearButton, "click", this.onClearButton.bind(this));
        }

        const anyButtonVisible: boolean = this.applyActive || this.clearActive;
        _.setVisible(this.eButtonsPanel, anyButtonVisible);

        this.initialiseFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
    }

    public onClearButton() {
        this.setModel(null);
        this.onFilterChanged();
    }

    public abstract customInit(): void;
    public abstract isFilterActive(): boolean;
    public abstract modelFromFloatingFilter(from: string): M;
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    public abstract bodyTemplate(type: FilterConditionType): string;
    public abstract resetState(resetConditionFilterOnly?: boolean): void;
    public abstract serialize(type: FilterConditionType): M;
    public abstract parse(toParse: M, type: FilterConditionType): void;
    public abstract refreshFilterBodyUi(type: FilterConditionType): void;
    public abstract initialiseFilterBodyUi(type: FilterConditionType): void;
    public abstract isFilterConditionActive(type: FilterConditionType): boolean;

    public floatingFilter(from: string): void {
        if (from !== '') {
            const model: M = this.modelFromFloatingFilter(from);
            this.setModel(model);
        } else {
            this.resetState();
        }
        this.onFilterChanged();
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetState();
        }
    }

    public getModel(): M | CombinedFilter<M> {
        if (this.isFilterActive()) {
            if (!this.isFilterConditionActive (FilterConditionType.CONDITION)) {
                return this.serialize(FilterConditionType.MAIN);
            } else {
                return {
                    condition1: this.serialize(FilterConditionType.MAIN),
                    condition2: this.serialize(FilterConditionType.CONDITION),
                    operator: this.conditionValue
                };
            }
        } else {
            return null;
        }
    }

    public getNullableModel(): M | CombinedFilter<M> {
        if (!this.isFilterConditionActive (FilterConditionType.CONDITION)) {
            return this.serialize(FilterConditionType.MAIN);
        } else {
            return {
                condition1: this.serialize(FilterConditionType.MAIN),
                condition2: this.serialize(FilterConditionType.CONDITION),
                operator: this.conditionValue
            };
        }
    }

    public setModel(model: M | CombinedFilter<M>): void {
        if (model) {
            if (!(model as CombinedFilter<M>).operator) {
                this.resetState();
                this.parse (model as M, FilterConditionType.MAIN);
            } else {
                const asCombinedFilter = model as CombinedFilter<M>;
                this.parse ((asCombinedFilter).condition1, FilterConditionType.MAIN);
                this.parse ((asCombinedFilter).condition2, FilterConditionType.CONDITION);

                this.conditionValue = asCombinedFilter.operator;
            }
        } else {
            this.resetState();
        }
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    private doOnFilterChanged(applyNow: boolean = false): boolean {
        this.filterParams.filterModifiedCallback();
        const requiresApplyAndIsApplying: boolean = this.applyActive && applyNow;
        const notRequiresApply: boolean = !this.applyActive;

        const shouldFilter: boolean = notRequiresApply || requiresApplyAndIsApplying;
        if (shouldFilter) {
            this.filterParams.filterChangedCallback();
        }
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
        return shouldFilter;
    }

    public onFilterChanged(applyNow: boolean = false): void {
        this.doOnFilterChanged(applyNow);
        this.redrawCondition();
        this.refreshFilterBodyUi(FilterConditionType.MAIN);
        this.refreshFilterBodyUi(FilterConditionType.CONDITION);
    }

    private redrawCondition() {
        const filterCondition: HTMLElement = this.eFilterBodyWrapper.querySelector('.ag-filter-condition') as HTMLElement;
        if (!filterCondition && this.isFilterActive() && this.acceptsBooleanLogic()) {
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

    private refreshOperatorUi() {
        const andButton: HTMLInputElement = this.eConditionWrapper.querySelector('.and') as HTMLInputElement;
        const orButton: HTMLInputElement = this.eConditionWrapper.querySelector('.or') as HTMLInputElement;
        this.conditionValue = this.conditionValue == null ? 'AND' : this.conditionValue;

        andButton.checked = this.conditionValue === 'AND';
        orButton.checked = this.conditionValue === 'OR';
        return {andButton, orButton};
    }

    public onFloatingFilterChanged(change: FloatingFilterChange): boolean {
        //It has to be of the type FloatingFilterWithApplyChange if it gets here
        const casted: BaseFloatingFilterChange<M> = change as BaseFloatingFilterChange<M>;
        if (casted == null) {
            this.setModel(null);
        } else if (! this.isFilterConditionActive(FilterConditionType.CONDITION)) {
            this.setModel(casted ? casted.model : null);
        } else {
            const combinedFilter :CombinedFilter<M> = {
                condition1: casted.model,
                condition2: this.serialize(FilterConditionType.CONDITION),
                operator: this.conditionValue
            };
            this.setModel(combinedFilter);
        }

        return this.doOnFilterChanged(casted ? casted.apply : false);
    }

    public generateFilterHeader(type:FilterConditionType): string {
        return '';
    }

    private generateTemplate(): string {
        const translate = this.translate.bind(this);
        const mainConditionBody = this.createConditionBody(FilterConditionType.MAIN);
        const bodyWithBooleanLogic: string = ! this.acceptsBooleanLogic() ?
            mainConditionBody :
            this.wrapCondition (mainConditionBody);

        return `<div>
                    <div class='ag-filter-body-wrapper'>${bodyWithBooleanLogic}</div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="clearButton">${translate('clearFilter')}</button>
                        <button type="button" id="applyButton">${translate('applyFilter')}</button>
                    </div>
                </div>`;
    }

    public acceptsBooleanLogic(): boolean {
        return false;
    }

    public wrapCondition(mainCondition:string): string {
        if (!this.isFilterActive()) { return mainCondition; }
        return  `${mainCondition}${this.createConditionTemplate(FilterConditionType.CONDITION)}`;
    }

    private createConditionTemplate(type:FilterConditionType): string {
        return `<div class="ag-filter-condition">
            <input id="andId" type="radio" class="and" name="booleanLogic" value=${this.translate('AND')}
                   checked="checked" /><label style="display: inline" for="andId">${this.translate('andCondition')}</label>
            <input id="orId" type="radio" class="or" name="booleanLogic" value="OR" /><label style="display: inline"
                   for="orId">${this.translate('orCondition')}</label>
            <div>${this.createConditionBody(type)}</div>
        </div>`;
    }

    private createConditionBody(type:FilterConditionType): string {
        const body: string = this.bodyTemplate(type);
        return this.generateFilterHeader(type) + body;
    }

    public translate(toTranslate: string): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        let defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];

        if (!defaultTranslation && this.customFilterOptions[toTranslate]) {
            defaultTranslation = this.customFilterOptions[toTranslate].displayName;
        }

        return translate(toTranslate, defaultTranslation);
    }

    public getDebounceMs(filterParams: ITextFilterParams | INumberFilterParams): number {
        if (this.applyActive) {
            if (filterParams.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when applyButton = true');
            }
            return 0;
        }
        return filterParams.debounceMs != null ? filterParams.debounceMs : 500;
    }

    public doesFilterHaveHiddenInput(filterType: string) {
        const customFilterOption = this.customFilterOptions[filterType];
        return customFilterOption && customFilterOption.hideFilterInput;
    }
}

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class ComparableBaseFilter<T, P extends IComparableFilterParams, M> extends BaseFilter<T, P, M> {
    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    @QuerySelector('#filterConditionType')
    private eTypeConditionSelector: HTMLSelectElement;

    private suppressAndOrCondition: boolean;

    public abstract getApplicableFilterTypes(): string[];
    public abstract filterValues(type:FilterConditionType): T | T[];
    public abstract individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType): boolean;

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const mainFilterResult = this.individualFilterPasses(params, FilterConditionType.MAIN);
        if (this.eTypeConditionSelector == null) {
            return mainFilterResult;
        }

        const auxFilterResult = this.individualFilterPasses(params, FilterConditionType.CONDITION);
        return this.conditionValue === 'AND' ? mainFilterResult && auxFilterResult : mainFilterResult || auxFilterResult;
    }

    public init(params: P) {
        super.init(params);
        this.suppressAndOrCondition = params.suppressAndOrCondition;
    }

    public customInit() {
        if (!this.defaultFilter) {
            this.defaultFilter = this.getDefaultType();
        }
    }

    public acceptsBooleanLogic(): boolean {
        return this.suppressAndOrCondition !== true;
    }

    public generateFilterHeader(type:FilterConditionType): string {
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

    public initialiseFilterBodyUi(type:FilterConditionType) {
        if (type === FilterConditionType.MAIN) {
            this.setFilterType(this.selectedFilter, type);
            this.addDestroyableEventListener(this.eTypeSelector, "change", () => this.onFilterTypeChanged (type));
        } else {
            this.setFilterType(this.selectedFilterCondition, type);
            this.addDestroyableEventListener(this.eTypeConditionSelector, "change", () => this.onFilterTypeChanged (type));
        }
    }

    public abstract getDefaultType(): string;

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
            if (this.selectedFilter === BaseFilter.EMPTY) {
                this.resetState();
            }

            this.onFilterChanged();
        }
    }

    public isFilterActive(): boolean {

        // the main selected filter is always active when there is no input field
        if (this.doesFilterHaveHiddenInput(this.selectedFilter)) {
            return true;
        }

        const rawFilterValues = this.filterValues(FilterConditionType.MAIN);
        if (rawFilterValues && this.selectedFilter === BaseFilter.IN_RANGE) {
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

export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}

export interface IComparableFilterParams extends IFilterParams {
    suppressAndOrCondition: boolean;
}

export interface IScalarFilterParams extends IComparableFilterParams {
    inRangeInclusive?: boolean;
    nullComparator?: NullComparator;
}

/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
export abstract class ScalarBaseFilter<T, P extends IScalarFilterParams, M> extends ComparableBaseFilter<T, P, M> {
    static readonly DEFAULT_NULL_COMPARATOR: NullComparator = {
        equals: false,
        lessThan: false,
        greaterThan: false
    };

    public abstract comparator(): Comparator<T>;

    private nullComparator(type: string): Comparator<T> {
        return (filterValue: T, gridValue: T): number => {
            if (gridValue == null) {
                const nullValue = this.translateNull (type);

                if (this.selectedFilter === BaseFilter.EMPTY) {
                    return 0;
                }

                if (this.selectedFilter === BaseFilter.EQUALS) {
                    return nullValue ? 0 : 1;
                }

                if (this.selectedFilter === BaseFilter.GREATER_THAN) {
                    return nullValue ? 1 : -1;
                }

                if (this.selectedFilter === BaseFilter.GREATER_THAN_OR_EQUAL) {
                    return nullValue ? 1 : -1;
                }

                if (this.selectedFilter === BaseFilter.LESS_THAN_OR_EQUAL) {
                    return nullValue ? -1 : 1;
                }

                if (this.selectedFilter === BaseFilter.LESS_THAN) {
                    return nullValue ? -1 : 1;
                }

                if (this.selectedFilter === BaseFilter.NOT_EQUAL) {
                    return nullValue ? 1 : 0;
                }
            }

            const actualComparator: Comparator<T> = this.comparator();
            return actualComparator (filterValue, gridValue);
        };
    }

    public getDefaultType(): string {
        return BaseFilter.EQUALS;
    }

    private translateNull(type: string): boolean {
        const reducedType: string =
            type.indexOf('greater') > -1 ? 'greaterThan' :
            type.indexOf('lessThan') > -1 ? 'lessThan' :
            'equals';

        if (this.filterParams.nullComparator && (this.filterParams.nullComparator as any)[reducedType]) {
            return (this.filterParams.nullComparator as any)[reducedType];
        }

        return (ScalarBaseFilter.DEFAULT_NULL_COMPARATOR as any)[reducedType];
    }

    individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType) {
        return this.doIndividualFilterPasses(params, type, type === FilterConditionType.MAIN ? this.selectedFilter : this.selectedFilterCondition);
    }

    private doIndividualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType, filter: string) {
        const cellValue: any = this.filterParams.valueGetter(params.node);

        const rawFilterValues: T[] | T = this.filterValues(type);
        const filterValue: T = Array.isArray(rawFilterValues) ? rawFilterValues[0] : rawFilterValues;

        const customFilterOption = this.customFilterOptions[filter];
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterValue != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterValue, cellValue);
            }
        }

        if (filterValue == null) {
            return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        }

        const comparator: Comparator<T> = this.nullComparator (filter as string);
        const compareResult = comparator(filterValue, cellValue);

        if (filter === BaseFilter.EMPTY) {
            return false;
        }

        if (filter === BaseFilter.EQUALS) {
            return compareResult === 0;
        }

        if (filter === BaseFilter.GREATER_THAN) {
            return compareResult > 0;
        }

        if (filter === BaseFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }

        if (filter === BaseFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }

        if (filter === BaseFilter.LESS_THAN) {
            return compareResult < 0;
        }

        if (filter === BaseFilter.NOT_EQUAL) {
            return compareResult != 0;
        }

        //From now on the type is a range and rawFilterValues must be an array!
        const compareToResult: number = comparator((rawFilterValues as T[])[1], cellValue);
        if (filter === BaseFilter.IN_RANGE) {
            if (!this.filterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            } else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }

        throw new Error('Unexpected type of filter: ' + filter);
    }
}
import {Component} from "../../widgets/component";
import {IDoesFilterPassParams, IFilterComp, IFilterOptionDef, IFilterParams} from "../../interfaces/iFilter";
import {QuerySelector} from "../../widgets/componentAnnotations";
import {Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {BaseFloatingFilterChange, FloatingFilterChange} from "../floating/floatingFilter";
import {ITextFilterParams} from "./text/textFilter";
import {_} from "../../utils";
import {INumberFilterParams} from "./number/numberFilter";

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
export abstract class AbstractFilter<P extends IFilterParams, M> extends Component implements IFilterComp {

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

        const templateString = this.generateTemplate();
        this.setTemplate(templateString);

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
        const mainConditionBody = this.createConditionBody(FilterConditionType.MAIN);
        const showTwoConditions = this.allowTwoConditions();

        const bodyWithTwoConditions = showTwoConditions ?
            this.wrapCondition(mainConditionBody) :
            mainConditionBody;

        const translate = this.translate.bind(this);

        return `<div>
                    <div class='ag-filter-body-wrapper'>${bodyWithTwoConditions}</div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="clearButton">${translate('clearFilter')}</button>
                        <button type="button" id="applyButton">${translate('applyFilter')}</button>
                    </div>
                </div>`;
    }

    public allowTwoConditions(): boolean {
        return false;
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
        return `<div class="ag-filter-condition">
            <input id="andId" type="radio" class="and" name="booleanLogic" value=${this.translate('AND')}
                   checked="checked" /><label style="display: inline" for="andId">${this.translate('andCondition')}</label>
            <input id="orId" type="radio" class="or" name="booleanLogic" value="OR" /><label style="display: inline"
                   for="orId">${this.translate('orCondition')}</label>
            <div>${this.createConditionBody(type)}</div>
        </div>`;
    }

    private createConditionBody(type:FilterConditionType): string {
        const bodyTemplate = this.bodyTemplate(type);
        const headerTemplate = this.generateFilterHeader(type);
        return headerTemplate + bodyTemplate;
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


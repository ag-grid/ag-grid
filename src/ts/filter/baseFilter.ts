import {Component} from "../widgets/component";
import {IFilterComp, IDoesFilterPassParams, IFilterParams} from "../interfaces/iFilter";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {_} from "../utils";
import {
    IFloatingFilterParams, InputTextFloatingFilterComp, FloatingFilterChange,
    BaseFloatingFilterChange
} from "./floatingFilter";


export interface Comparator<T>{
    (left:T, right:T):number
}

const DEFAULT_TRANSLATIONS : {[name:string]:string}= {
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
    clearFilter: 'Clear Filter'
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
export abstract class BaseFilter<T, P extends IFilterParams, M> extends Component implements IFilterComp {
    public static EQUALS = 'equals';
    public static NOT_EQUAL = 'notEqual';
    public static LESS_THAN = 'lessThan';
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
    public static GREATER_THAN = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
    public static IN_RANGE = 'inRange';

    public static CONTAINS = 'contains';//1;
    public static NOT_CONTAINS = 'notContains';//1;
    public static STARTS_WITH = 'startsWith';//4;
    public static ENDS_WITH = 'endsWith';//5;

    private newRowsActionKeep: boolean;


    filterParams: P;
    clearActive: boolean;
    applyActive: boolean;
    filter:string = 'equals';

    @QuerySelector('#applyPanel')
    private eButtonsPanel: HTMLElement;

    @QuerySelector('#applyButton')
    private eApplyButton: HTMLElement;

    @QuerySelector('#clearButton')
    private eClearButton: HTMLElement;

    @Autowired('context')
    public context: Context;

    @Autowired('gridOptionsWrapper')
    private gridOptionsWrapper: GridOptionsWrapper;

    public init(params: P): void {
        this.filterParams = params;
        this.clearActive = params.clearButton === true;
        //Allowing for old param property apply, even though is not advertised through the interface
        this.applyActive = ((params.applyButton === true) || ((<any>params).apply === true));
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


        let anyButtonVisible: boolean = this.applyActive || this.clearActive;
        _.setVisible(this.eButtonsPanel, anyButtonVisible);


        this.instantiate(this.context);
        this.initialiseFilterBodyUi();
        this.refreshFilterBodyUi();

    }


    public onClearButton (){
        this.setModel(null);
        this.onFilterChanged();
    }


    public abstract isFilterActive(): boolean;
    public abstract modelFromFloatingFilter(from:string): M;
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    public abstract bodyTemplate(): string;
    public abstract resetState(): void;
    public abstract serialize(): M;
    public abstract parse(toParse:M): void;
    public abstract refreshFilterBodyUi(): void;
    public abstract initialiseFilterBodyUi(): void;


    public floatingFilter(from:string): void{
        if (from !== ''){
            let model: M = this.modelFromFloatingFilter(from);
            this.setModel(model);
        } else {
            this.resetState();
        }
        this.onFilterChanged();
    }


    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetState ();
        }
    }

    public getModel(): M {
        if (this.isFilterActive()) {
            return this.serialize();
        } else {
            return null;
        }
    }

    public getNullableModel(): M {
        return this.serialize();
    }

    public setModel(model: M): void {
        if (model) {
            this.parse (model);
        } else {
            this.resetState();
        }
        this.refreshFilterBodyUi();
    }

    private doOnFilterChanged (applyNow:boolean = false):void{
        this.filterParams.filterModifiedCallback();
        let requiresApplyAndIsApplying: boolean = this.applyActive && applyNow;
        let notRequiresApply: boolean = !this.applyActive;

        let shouldFilter:boolean = notRequiresApply || requiresApplyAndIsApplying;
        if (shouldFilter) {
            this.filterParams.filterChangedCallback();
        }
        this.refreshFilterBodyUi();
    }

    public onFilterChanged ():void{
        this.doOnFilterChanged();
    }

    public onFloatingFilterChanged (change:FloatingFilterChange):void{
        //It has to be of the type FloatingFilterWithApplyChange if it gets here
        let casted:BaseFloatingFilterChange<M> = <BaseFloatingFilterChange<M>>change;
        this.setModel(casted.model);
        this.doOnFilterChanged(casted.apply);
    }

    public generateFilterHeader():string{
        return '';
    }

    private generateTemplate(): string {
        let translate = this.translate.bind(this);
        let body:string = this.bodyTemplate();

        return `<div>
                    ${this.generateFilterHeader()}
                    ${body}
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="clearButton">${translate('clearFilter')}</button>
                        <button type="button" id="applyButton">${translate('applyFilter')}</button>
                    </div>
                </div>`;
    }

    public translate(toTranslate:string):string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, DEFAULT_TRANSLATIONS[toTranslate]);
    }

}


/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export abstract class ComparableBaseFilter<T, P extends IFilterParams, M> extends BaseFilter<T, P, M>{
    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    public abstract getApplicableFilterTypes(): string[];
    public abstract filterValues(): T | T[];

    public init(params:P){
        super.init(params);
        this.addDestroyableEventListener(this.eTypeSelector, "change", this.onFilterTypeChanged.bind(this));
    }
    
    public generateFilterHeader(): string {
        let optionsHtml: string[] = this.getApplicableFilterTypes().map(filterType => {
            let localeFilterName = this.translate(filterType);
            return `<option value="${filterType}">${localeFilterName}</option>`;
        });

        return optionsHtml.length <= 0 ?
            '' :
            `<div>
                <select class="ag-filter-select" id="filterType">
                    ${optionsHtml.join('')}
                </select>
            </div>`;
    }

    private onFilterTypeChanged (): void{
        this.filter = this.eTypeSelector.value;
        this.refreshFilterBodyUi();
        this.onFilterChanged();
    }

    public isFilterActive(): boolean {
        let rawFilterValues = this.filterValues();
        if (this.filter === BaseFilter.IN_RANGE) {
            let filterValueArray = (<T[]>rawFilterValues);
            return filterValueArray[0] != null && filterValueArray[1] != null;
        } else {
            return rawFilterValues != null;
        }
    }

    public setFilterType (filterType:string):void{
        this.filter = filterType;
        this.eTypeSelector.value = filterType;
    }
}

export interface IScalarFilterParams extends IFilterParams{
    inRangeInclusive?:boolean
}

/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
export abstract class ScalarBaseFilter<T, P extends IScalarFilterParams, M> extends ComparableBaseFilter<T, P, M>{
    public abstract comparator(): Comparator<T>;

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        var value:any = this.filterParams.valueGetter(params.node);
        let comparator: Comparator<T> = this.comparator();

        let rawFilterValues : T[] | T= this.filterValues();
        let from : T= Array.isArray(rawFilterValues) ? rawFilterValues[0]: rawFilterValues;
        if (!from) return true;

        let compareResult = comparator(from, value);

        if (this.filter === BaseFilter.EQUALS){
            return compareResult === 0;
        }

        if (this.filter === BaseFilter.GREATER_THAN){
            return compareResult > 0;
        }

        if (this.filter === BaseFilter.GREATER_THAN_OR_EQUAL){
            return compareResult >= 0;
        }

        if (this.filter === BaseFilter.LESS_THAN_OR_EQUAL){
            return compareResult <= 0;
        }

        if (this.filter === BaseFilter.LESS_THAN){
            return compareResult < 0;
        }

        if (this.filter === BaseFilter.NOT_EQUAL){
            return compareResult != 0;
        }

        //From now on the type is a range and rawFilterValues must be an array!
        let compareToResult: number = comparator((<T[]>rawFilterValues)[1], value);
        if (this.filter === BaseFilter.IN_RANGE){
            if (!this.filterParams.inRangeInclusive){
                return compareResult > 0 && compareToResult < 0
            }else{
                return compareResult >= 0 && compareToResult <= 0
            }
        }

        throw new Error('Unexpected type of date filter!: ' + this.filter);
    }
}
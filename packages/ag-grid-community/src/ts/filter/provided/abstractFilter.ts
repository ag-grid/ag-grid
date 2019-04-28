import { Component } from "../../widgets/component";
import {FilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams} from "../../interfaces/iFilter";
import { QuerySelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { BaseFloatingFilterChange, FloatingFilterChange } from "../floating/floatingFilter";
import { ITextFilterParams } from "./text/textFilter";
import { _ } from "../../utils";
import { INumberFilterParams } from "./number/numberFilter";

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

/**
 * T(ype) The type of this filter. ie in DateFilter T=Date
 * P(arams) The params that this filter can take
 * M(model getModel/setModel) The object that this filter serializes to
 * F Floating filter params
 *
 * Contains common logic to ALL filters.. Translation, apply and clear button
 * get/setModel context wiring....
 */
export abstract class AbstractFilter<P extends IFilterParams, M extends FilterModel> extends Component implements IFilterComp {

    private newRowsActionKeep: boolean;

    filterParams: P;
    clearActive: boolean;
    applyActive: boolean;

    @QuerySelector('#applyPanel')
    private eButtonsPanel: HTMLElement;

    @QuerySelector('.ag-filter-body-wrapper')
    protected eFilterBodyWrapper: HTMLElement;

    @QuerySelector('#applyButton')
    private eApplyButton: HTMLElement;

    @QuerySelector('#clearButton')
    private eClearButton: HTMLElement;

    conditionValue: string;

    @Autowired('gridOptionsWrapper')
    gridOptionsWrapper: GridOptionsWrapper;

    // take this out also
    private doTemplateInPostConstruct: boolean;

    // in time we should take this out, sub-classes should override init() and call super.init()
    protected customInit(): void {}

    public abstract isFilterActive(): boolean;
    public abstract modelFromFloatingFilter(from: string): M;
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    public abstract resetState(resetConditionFilterOnly?: boolean): void;
    public abstract serialize(type: FilterConditionType): M;
    public abstract parse(toParse: M, type: FilterConditionType): void;

    protected refreshFilterBodyUi(type: FilterConditionType): void {}
    protected initialiseFilterBodyUi(type: FilterConditionType): void {}

    protected abstract bodyTemplate(): string;

    public abstract getModel(): any;
    public abstract setModel(model: any): void;

    constructor(doTemplateInPostCreate = false) {
        super();
        this.doTemplateInPostConstruct = doTemplateInPostCreate;
    }

    @PostConstruct
    protected postConstruct(): void {
        if (this.doTemplateInPostConstruct) {
            const templateString = this.generateTemplate();
            this.setTemplate(templateString);
        }
    }

    public init(params: P): void {
        this.filterParams = params;

        this.customInit();

        this.clearActive = params.clearButton === true;
        //Allowing for old param property apply, even though is not advertised through the interface
        this.applyActive = ((params.applyButton === true) || ((params as any).apply === true));
        this.newRowsActionKeep = params.newRowsAction === 'keep';

        if (!this.doTemplateInPostConstruct) {
            const templateString = this.generateTemplate();
            this.setTemplate(templateString);
        }

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
    }

    protected isFilterConditionActive(type: FilterConditionType): boolean {
        return false;
    }

    public onFloatingFilterChanged(change: FloatingFilterChange): boolean {
        //It has to be of the type FloatingFilterWithApplyChange if it gets here
        const casted: BaseFloatingFilterChange = change as BaseFloatingFilterChange;
        if (casted == null) {
            this.setModel(null);
        } else if (! this.isFilterConditionActive(FilterConditionType.CONDITION)) {
            this.setModel(casted ? casted.model : null);
        } else {
            // const combinedFilter :CombinedFilter<M> = {
            //     condition1: casted.model,
            //     condition2: this.serialize(FilterConditionType.CONDITION),
            //     operator: this.conditionValue
            // };
            // this.setModel(combinedFilter);
        }

        return this.doOnFilterChanged(casted ? casted.apply : false);
    }

    private generateTemplate(): string {

        const body = this.bodyTemplate();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div>
                    <div class='ag-filter-body-wrapper'>${body}</div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="clearButton">${translate('clearFilter', 'Clear Filter')}</button>
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`;
    }

    public isAllowTwoConditions(): boolean {
        return false;
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

}

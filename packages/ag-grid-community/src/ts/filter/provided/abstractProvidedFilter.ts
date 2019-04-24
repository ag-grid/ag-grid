import {Component} from "../../widgets/component";
import {FilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams} from "../../interfaces/iFilter";
import {QuerySelector} from "../../widgets/componentAnnotations";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FloatingFilterChange} from "../floating/floatingFilter";
import {_} from "../../utils";

export interface IAbstractProvidedFilterParams extends IFilterParams {
    debounceMs?: number;
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
export abstract class AbstractProvidedFilter extends Component implements IFilterComp {

    private newRowsActionKeep: boolean;

    private abstractProvidedFilterParams: IAbstractProvidedFilterParams;
    private clearActive: boolean;
    private applyActive: boolean;

    @QuerySelector('#applyPanel')
    private eButtonsPanel: HTMLElement;

    @QuerySelector('.ag-filter-body-wrapper')
    protected eFilterBodyWrapper: HTMLElement;

    @QuerySelector('#applyButton')
    private eApplyButton: HTMLElement;

    @QuerySelector('#clearButton')
    private eClearButton: HTMLElement;

    @Autowired('gridOptionsWrapper')
    protected gridOptionsWrapper: GridOptionsWrapper;

    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateVisibilityOfComponents(): void;
    protected abstract modelFromFloatingFilter(from: string): FilterModel;

    protected abstract bodyTemplate(): string;
    protected abstract reset(): void;

    protected abstract setModelIntoGui(model: FilterModel): void;
    protected abstract getModelFromGui(): FilterModel;
    protected abstract areModelsEqual(a: FilterModel, b: FilterModel): boolean;
    protected abstract convertDeprecatedModelType(model: FilterModel): FilterModel;

    private appliedModel: FilterModel;

    private onBtApplyDebounce: ()=>void;

    protected getAppliedModel(): FilterModel {
        return this.appliedModel;
    }

    public isFilterActive(): boolean {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    }

    @PostConstruct
    protected postConstruct(): void {
        const templateString = this.generateTemplate();
        this.setTemplate(templateString);
    }

    public init(params: IFilterParams): void {
        this.abstractProvidedFilterParams = params;

        this.clearActive = params.clearButton === true;
        // Allowing for old param property apply, even though is not advertised through the interface
        const deprecatedApply = (params as any).apply === true;
        this.applyActive = (params.applyButton===true) || deprecatedApply;
        this.newRowsActionKeep = params.newRowsAction === 'keep';

        _.setVisible(this.eApplyButton, this.applyActive);
        this.addDestroyableEventListener(this.eApplyButton, "click", this.onBtApply.bind(this));

        _.setVisible(this.eClearButton, this.clearActive);
        this.addDestroyableEventListener(this.eClearButton, "click", this.onBtClear.bind(this));

        const anyButtonVisible: boolean = this.applyActive || this.clearActive;
        _.setVisible(this.eButtonsPanel, anyButtonVisible);

        this.reset();
        this.updateVisibilityOfComponents();
        this.setupOnBtApplyDebounce();
    }

    private setupOnBtApplyDebounce(): void {
        const debounceMs = this.getDebounceMs();
        this.onBtApplyDebounce = _.debounce(this.onBtApply.bind(this), debounceMs);
    }

    public getModel(): FilterModel {
        return this.appliedModel;
    }

    public setModel(model: FilterModel): void {
        if (model) {
            const modelNotDeprecated = this.convertDeprecatedModelType(model);
            this.setModelIntoGui(modelNotDeprecated);
        } else {
            this.reset();
        }
        this.updateVisibilityOfComponents();

        // we set the model from the gui, rather than the provided model,
        // so the model is consistent. eg handling of null/undefined will be the same,
        // of if model is case insensitive, then casing is removed.
        this.appliedModel = this.getModelFromGui();
    }

    private onBtClear() {
        this.reset();
        this.updateVisibilityOfComponents();
        this.onFilterChanged();
    }

    private onBtApply() {
        const oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromGui();

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        const newModelDifferent = !this.areModelsEqual(this.appliedModel, oldAppliedModel);
        if (newModelDifferent) {
            this.abstractProvidedFilterParams.filterChangedCallback();
        }
    }

    public floatingFilter(from: string): void {
        if (from !== '') {
            const model: FilterModel = this.modelFromFloatingFilter(from);
            this.setModel(model);
        } else {
            // this.resetState();
        }
        this.onFilterChanged();
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.reset();
            this.appliedModel = null;
        }
    }

    protected onFilterChanged(): void {
        this.updateVisibilityOfComponents();
        this.abstractProvidedFilterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.onBtApplyDebounce();
        }
    }

    public onFloatingFilterChanged(change: FloatingFilterChange): boolean {
        return false;
/*        //It has to be of the type FloatingFilterWithApplyChange if it gets here
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

        return this.doOnFilterChanged(casted ? casted.apply : false);*/
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

    private getDebounceMs(): number {
        if (this.applyActive) {
            if (this.abstractProvidedFilterParams.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when applyButton = true');
            }
            return 0;
        }
        return this.abstractProvidedFilterParams.debounceMs != null ? this.abstractProvidedFilterParams.debounceMs : 500;
    }

}

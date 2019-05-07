import {Component} from "../../widgets/component";
import {FilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams} from "../../interfaces/iFilter";
import {RefSelector} from "../../widgets/componentAnnotations";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {BaseFloatingFilterChange} from "../floating/floatingFilter";
import {_} from "../../utils";

export interface IAbstractProvidedFilterParams extends IFilterParams {
    debounceMs?: number;
}

/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with ag-Grid extend this class. User filters do not
 * extend this class.
 */
export abstract class AbstractProvidedFilter extends Component implements IFilterComp {

    private newRowsActionKeep: boolean;

    // each level in the hierarchy will save params with the appropriate type for that level.
    private abstractProvidedFilterParams: IAbstractProvidedFilterParams;

    private clearActive: boolean;
    private applyActive: boolean;

    @RefSelector('eButtonsPanel')
    private eButtonsPanel: HTMLElement;

    @RefSelector('eFilterBodyWrapper')
    protected eFilterBodyWrapper: HTMLElement;

    @RefSelector('eApplyButton')
    private eApplyButton: HTMLElement;

    @RefSelector('eClearButton')
    private eClearButton: HTMLElement;

    @Autowired('gridOptionsWrapper')
    protected gridOptionsWrapper: GridOptionsWrapper;

    // part if IFilter interface, hence public
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract resetUiToDefaults(): void;

    protected abstract setModelIntoUi(model: FilterModel): void;
    protected abstract getModelFromUi(): FilterModel | null;
    protected abstract areModelsEqual(a: FilterModel, b: FilterModel): boolean;

    // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
    // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
    // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
    // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
    // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
    // not active) then this appliedModel will be null/undefined.
    private appliedModel: FilterModel;

    // a debounce of the onBtApply method
    private onBtApplyDebounce: () => void;

    public isFilterActive(): boolean {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    }

    @PostConstruct
    protected postConstruct(): void {
        const templateString = this.createTemplate();
        this.setTemplate(templateString);
    }

    public init(params: IFilterParams): void {
        this.setParams(params);
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.setupOnBtApplyDebounce();
    }

    protected setParams(params: IFilterParams): void {
        this.abstractProvidedFilterParams = params;

        this.clearActive = params.clearButton === true;
        // Allowing for old param property apply, even though is not advertised through the interface
        const deprecatedApply = (params as any).apply === true;
        this.applyActive = (params.applyButton === true) || deprecatedApply;
        this.newRowsActionKeep = params.newRowsAction === 'keep';

        _.setVisible(this.eApplyButton, this.applyActive);
        this.addDestroyableEventListener(this.eApplyButton, "click", this.onBtApply.bind(this));

        _.setVisible(this.eClearButton, this.clearActive);
        this.addDestroyableEventListener(this.eClearButton, "click", this.onBtClear.bind(this));

        const anyButtonVisible: boolean = this.applyActive || this.clearActive;
        _.setVisible(this.eButtonsPanel, anyButtonVisible);
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
            this.setModelIntoUi(model);
        } else {
            this.resetUiToDefaults();
        }
        this.updateUiVisibility();

        // we set the model from the gui, rather than the provided model,
        // so the model is consistent. eg handling of null/undefined will be the same,
        // of if model is case insensitive, then casing is removed.
        this.appliedModel = this.getModelFromUi();
    }

    private onBtClear() {
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.onUiChanged();
    }

    private onBtApply() {
        const oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromUi();

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        const newModelDifferent = !this.areModelsEqual(this.appliedModel, oldAppliedModel);
        if (newModelDifferent) {
            this.abstractProvidedFilterParams.filterChangedCallback();
        }
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults();
            this.appliedModel = null;
        }
    }

    protected onUiChanged(applyNow = false): void {
        this.updateUiVisibility();
        this.abstractProvidedFilterParams.filterModifiedCallback();

        // applyNow=true for floating filter changes, we always act on these immediately
        if (applyNow) {
            this.onBtApply();
        // otherwise if no apply button, we apply (but debounce for time delay)
        } else if (!this.applyActive) {
            this.onBtApplyDebounce();
        }
    }

    private createTemplate(): string {

        const body = this.createBodyTemplate();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div>
                    <div class='ag-filter-body-wrapper' ref="eFilterBodyWrapper">${body}</div>
                    <div class="ag-filter-apply-panel" ref="eButtonsPanel">
                        <button type="button" ref="eClearButton">${translate('clearFilter', 'Clear Filter')}</button>
                        <button type="button" ref="eApplyButton">${translate('applyFilter', 'Apply Filter')}</button>
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

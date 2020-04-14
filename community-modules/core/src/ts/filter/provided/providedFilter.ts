import { Component } from '../../widgets/component';
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { RefSelector } from '../../widgets/componentAnnotations';
import { Autowired, PostConstruct } from '../../context/context';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { _ } from '../../utils';
import { IRowModel } from '../../interfaces/iRowModel';
import { Constants } from '../../constants';

export interface IProvidedFilterParams extends IFilterParams {
    clearButton?: boolean;
    resetButton?: boolean;
    applyButton?: boolean;
    newRowsAction?: string;
    debounceMs?: number;
}

/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with ag-Grid extend this class. User filters do not
 * extend this class.
 */
export abstract class ProvidedFilter extends Component implements IFilterComp {

    private static NEW_ROWS_ACTION_KEEP = 'keep';
    private static NEW_ROWS_ACTION_CLEAR = 'clear';

    private newRowsActionKeep: boolean;

    // each level in the hierarchy will save params with the appropriate type for that level.
    private providedFilterParams: IProvidedFilterParams;

    private applyActive: boolean;

    @RefSelector('eButtonsPanel') private eButtonsPanel: HTMLElement;
    @RefSelector('eFilterBodyWrapper') protected eFilterBodyWrapper: HTMLElement;
    @RefSelector('eClearButton') private eClearButton: HTMLElement;
    @RefSelector('eResetButton') private eResetButton: HTMLElement;
    @RefSelector('eApplyButton') private eApplyButton: HTMLElement;

    @Autowired('gridOptionsWrapper') protected gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') protected rowModel: IRowModel;

    // part of IFilter interface, hence public
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(siltent?: boolean): void;

    protected abstract setModelIntoUi(model: ProvidedFilterModel): void;
    protected abstract areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean;

    public abstract getModelFromUi(): ProvidedFilterModel | null;

    // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
    // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
    // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
    // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
    // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
    // not active) then this appliedModel will be null/undefined.
    private appliedModel: ProvidedFilterModel | null = null;

    // a debounce of the onBtApply method
    private onBtApplyDebounce: () => void;

    /** @deprecated */
    public onFilterChanged(): void {
        console.warn(`ag-Grid: you should not call onFilterChanged() directly on the filter, please call
        gridApi.onFilterChanged() instead. onFilterChanged is not part of the exposed filter interface (it was
        a method that existed on an old version of the filters that was not intended for public use.`);
        this.providedFilterParams.filterChangedCallback();
    }

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
        this.resetUiToDefaults(true);
        this.updateUiVisibility();
        this.setupOnBtApplyDebounce();
    }

    protected setParams(params: IProvidedFilterParams): void {
        this.providedFilterParams = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(params);

        if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_KEEP) {
            this.newRowsActionKeep = true;
        } else if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_CLEAR) {
            this.newRowsActionKeep = false;
        } else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM the default is 'clear'
            const rowModelType = this.rowModel.getType();
            const modelsForKeep = [Constants.ROW_MODEL_TYPE_SERVER_SIDE, Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(rowModelType) >= 0;
        }

        _.setDisplayed(this.eApplyButton, this.applyActive);
        // we do not bind onBtApply here because onBtApply() has a parameter, and it is not the event. if we
        // just applied, the event would get passed as the second parameter, which we do not want.
        this.addDestroyableEventListener(this.eApplyButton, "click", () => this.onBtApply(true));

        const clearActive = params.clearButton === true;
        _.setDisplayed(this.eClearButton, clearActive);
        this.addDestroyableEventListener(this.eClearButton, "click", () => this.onBtClear());

        const resetActive = params.resetButton === true;
        _.setDisplayed(this.eResetButton, resetActive);
        this.addDestroyableEventListener(this.eResetButton, "click", () => this.onBtReset());

        const anyButtonVisible: boolean = this.applyActive || clearActive || resetActive;
        _.setDisplayed(this.eButtonsPanel, anyButtonVisible);
    }

    // subclasses can override this to provide alternative debounce defaults
    protected getDefaultDebounceMs(): number {
        return 0;
    }

    private setupOnBtApplyDebounce(): void {
        const debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = _.debounce(this.onBtApply.bind(this), debounceMs);
    }

    public getModel(): ProvidedFilterModel {
        return this.appliedModel;
    }

    public setModel(model: ProvidedFilterModel): void {
        if (model) {
            this.setModelIntoUi(model);
        } else {
            this.resetUiToDefaults();
        }
        this.updateUiVisibility();

        // we set the model from the gui, rather than the provided model,
        // so the model is consistent. eg handling of null/undefined will be the same,
        // of if model is case insensitive, then casing is removed.
        this.applyModel();
    }

    private onBtClear() {
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.onUiChanged();
    }

    private onBtReset() {
        this.onBtClear();
        this.onBtApply();
    }

    // returns true if the new model is different to the old model
    public applyModel(): boolean {
        const oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromUi();

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(this.appliedModel, oldAppliedModel);
    }

    protected onBtApply(afterFloatingFilter = false, afterDataChange = false) {
        const newModelDifferent = this.applyModel();

        if (newModelDifferent) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter, afterDataChange });
        }
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults();
            this.appliedModel = null;
        }
    }

    // called by set filter
    protected isNewRowsActionKeep(): boolean {
        return this.newRowsActionKeep;
    }

    protected onUiChanged(afterFloatingFilter = false): void {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();

        // applyNow=true for floating filter changes, we always act on these immediately
        if (afterFloatingFilter) {
            this.onBtApply(afterFloatingFilter);
            // otherwise if no apply button, we apply (but debounce for time delay)
        } else if (!this.applyActive) {
            this.onBtApplyDebounce();
        }
    }

    private createTemplate(): string {
        const body = this.createBodyTemplate();
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return /* html */`
            <div>
                <div class='ag-filter-body-wrapper ag-${this.getCssIdentifier()}-body-wrapper' ref="eFilterBodyWrapper">${body}</div>
                <div class="ag-filter-apply-panel" ref="eButtonsPanel">
                    <button type="button" ref="eClearButton" class="ag-standard-button ag-filter-apply-panel-button">${translate('clearFilter', 'Clear Filter')}</button>
                    <button type="button" ref="eResetButton" class="ag-standard-button ag-filter-apply-panel-button">${translate('resetFilter', 'Reset Filter')}</button>
                    <button type="button" ref="eApplyButton" class="ag-standard-button ag-filter-apply-panel-button">${translate('applyFilter', 'Apply Filter')}</button>
                </div>
            </div>`;
    }

    // static, as used by floating filter also
    public static getDebounceMs(params: IProvidedFilterParams, debounceDefault: number): number {
        const applyActive = ProvidedFilter.isUseApplyButton(params);

        if (applyActive) {
            if (params.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when applyButton = true');
            }

            return 0;
        }

        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    }

    // static, as used by floating filter also
    public static isUseApplyButton(params: IProvidedFilterParams): boolean {
        if ((params as any).apply && !params.applyButton) {
            console.warn('ag-Grid: as of ag-Grid v21, filterParams.apply is now filterParams.applyButton, please change to applyButton');
            params.applyButton = true;
        }

        return params.applyButton === true;
    }
}

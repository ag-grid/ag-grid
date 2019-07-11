import { Component } from "../../widgets/component";
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from "../../interfaces/iFilter";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { _ } from "../../utils";
import { IRowModel } from "../../interfaces/iRowModel";
import { Constants } from "../../constants";

export interface IProvidedFilterParams extends IFilterParams {
    clearButton?: boolean;
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

    @Autowired('rowModel')
    protected rowModel: IRowModel;

    // part of IFilter interface, hence public
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract resetUiToDefaults(): void;

    protected abstract setModelIntoUi(model: ProvidedFilterModel): void;
    protected abstract getModelFromUi(): ProvidedFilterModel | null;
    protected abstract areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean;

    // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
    // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
    // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
    // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
    // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
    // not active) then this appliedModel will be null/undefined.
    private appliedModel: ProvidedFilterModel;

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
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.setupOnBtApplyDebounce();
    }

    protected setParams(params: IProvidedFilterParams): void {
        this.providedFilterParams = params;

        this.clearActive = params.clearButton === true;
        this.applyActive = ProvidedFilter.isUseApplyButton(params);

        if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_KEEP) {
            this.newRowsActionKeep = true;
        } else if (params.newRowsAction === ProvidedFilter.NEW_ROWS_ACTION_CLEAR) {
            this.newRowsActionKeep = false;
        } else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM teh default is 'clear'
            const rowModelType = this.rowModel.getType();
            const modelsForKeep = [Constants.ROW_MODEL_TYPE_SERVER_SIDE, Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(rowModelType) >= 0;
        }

        _.setVisible(this.eApplyButton, this.applyActive);
        // we do not bind onBtApply here because onBtApply() has a parameter, and it is not the event. if we
        // just applied, the event would get passed as the second parameter, which we do not want.
        this.addDestroyableEventListener(this.eApplyButton, "click", () => this.onBtApply());

        _.setVisible(this.eClearButton, this.clearActive);
        this.addDestroyableEventListener(this.eClearButton, "click", this.onBtClear.bind(this));

        const anyButtonVisible: boolean = this.applyActive || this.clearActive;
        _.setVisible(this.eButtonsPanel, anyButtonVisible);
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
        this.appliedModel = this.getModelFromUi();
    }

    private onBtClear() {
        this.resetUiToDefaults();
        this.updateUiVisibility();
        this.onUiChanged();
    }

    // returns true if the new model is different to the old model
    protected updateModel(): boolean {
        const oldAppliedModel = this.appliedModel;
        this.appliedModel = this.getModelFromUi();

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        const newModelDifferent = !this.areModelsEqual(this.appliedModel, oldAppliedModel);
        return newModelDifferent;
    }

    private onBtApply(afterFloatingFilter = false) {
        const newModelDifferent = this.updateModel();
        if (newModelDifferent) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({afterFloatingFilter: afterFloatingFilter});
        }
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults();
            this.appliedModel = null;
        }
    }

    protected onUiChanged(afterFloatingFilter = false): void {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();

        // applyNow=true for floating filter changes, we always act on these immediately
        if (afterFloatingFilter) {
            this.onBtApply(true);
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

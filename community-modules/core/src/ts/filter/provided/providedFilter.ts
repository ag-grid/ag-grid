import { Component } from '../../widgets/component';
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { Autowired, PostConstruct } from '../../context/context';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { IRowModel } from '../../interfaces/iRowModel';
import { Constants } from '../../constants';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { loadTemplate, addCssClass } from '../../utils/dom';
import { debounce } from '../../utils/function';
import { Promise } from '../../utils/promise';

type FilterButton = 'apply' | 'clear' | 'reset' | 'cancel';

export interface IProvidedFilterParams extends IFilterParams {
    /** @deprecated */ clearButton?: boolean;
    /** @deprecated */ resetButton?: boolean;
    /** @deprecated */ applyButton?: boolean;
    buttons?: FilterButton[];
    closeOnApply?: boolean;
    /** @deprecated */ newRowsAction?: string;
    debounceMs?: number;
}

/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with ag-Grid extend this class. User filters do not
 * extend this class.
 */
export abstract class ProvidedFilter extends Component implements IFilterComp {
    private newRowsActionKeep: boolean;

    // each level in the hierarchy will save params with the appropriate type for that level.
    private providedFilterParams: IProvidedFilterParams;

    private applyActive = false;
    private hidePopup: () => void = null;

    @Autowired('gridOptionsWrapper') protected gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') protected rowModel: IRowModel;

    // part of IFilter interface, hence public
    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(silent?: boolean): Promise<void>;

    protected abstract setModelIntoUi(model: ProvidedFilterModel): Promise<void>;
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
        const templateString = /* html */`
            <div>
                <div class="ag-filter-body-wrapper ag-${this.getCssIdentifier()}-body-wrapper">
                    ${this.createBodyTemplate()}
                </div>
            </div>`;

        this.setTemplate(templateString);
    }

    public init(params: IFilterParams): Promise<void> {
        this.setParams(params);

        return this.resetUiToDefaults(true).then(() => {
            this.updateUiVisibility();
            this.setupOnBtApplyDebounce();
        });
    }

    protected setParams(params: IProvidedFilterParams): void {
        ProvidedFilter.checkForDeprecatedParams(params);

        this.providedFilterParams = params;

        if (params.newRowsAction === 'keep') {
            this.newRowsActionKeep = true;
        } else if (params.newRowsAction === 'clear') {
            this.newRowsActionKeep = false;
        } else {
            // the default for SSRM and IRM is 'keep', for CSRM and VRM the default is 'clear'
            const modelsForKeep = [Constants.ROW_MODEL_TYPE_SERVER_SIDE, Constants.ROW_MODEL_TYPE_INFINITE];
            this.newRowsActionKeep = modelsForKeep.indexOf(this.rowModel.getType()) >= 0;
        }

        this.applyActive = ProvidedFilter.isUseApplyButton(params);

        this.createButtonPanel();
    }

    private createButtonPanel(): void {
        const { buttons } = this.providedFilterParams;

        if (!buttons || buttons.length < 1) { return; }

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const eButtonsPanel = document.createElement('div');

        addCssClass(eButtonsPanel, 'ag-filter-apply-panel');

        const addButton = (text: string, clickListener: () => void): void => {
            const button = loadTemplate(/* html */
                `<button type="button" class="ag-standard-button ag-filter-apply-panel-button">${text}</button>`);

            eButtonsPanel.appendChild(button);
            this.addManagedListener(button, 'click', clickListener);
        };

        const creators = new Map<FilterButton, () => void>();

        creators.set('apply', () => addButton(translate('applyFilter', 'Apply Filter'), () => this.onBtApply()));
        creators.set('clear', () => addButton(translate('clearFilter', 'Clear Filter'), () => this.onBtClear()));
        creators.set('reset', () => addButton(translate('resetFilter', 'Reset Filter'), () => this.onBtReset()));
        creators.set('cancel', () => addButton(translate('cancelFilter', 'Cancel Filter'), () => this.onBtCancel()));

        new Set(buttons).forEach(button => creators.get(button)());

        this.getGui().appendChild(eButtonsPanel);
    }

    private static checkForDeprecatedParams(params: IProvidedFilterParams): void {
        const buttons = params.buttons || [];

        if (buttons.length > 0) { return; }

        const { applyButton, resetButton, clearButton } = params;

        if (clearButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.clearButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('clear');
        }

        if (resetButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.resetButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('reset');
        }

        if (applyButton) {
            console.warn('ag-Grid: as of ag-Grid v23.2, filterParams.applyButton is deprecated. Please use filterParams.buttons instead');
            buttons.push('apply');
        }

        if ((params as any).apply) {
            console.warn('ag-Grid: as of ag-Grid v21, filterParams.apply is deprecated. Please use filterParams.buttons instead');
            buttons.push('apply');
        }

        params.buttons = buttons;
    }

    // subclasses can override this to provide alternative debounce defaults
    protected getDefaultDebounceMs(): number {
        return 0;
    }

    private setupOnBtApplyDebounce(): void {
        const debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = debounce(this.onBtApply.bind(this), debounceMs);
    }

    public getModel(): ProvidedFilterModel {
        return this.appliedModel;
    }

    public setModel(model: ProvidedFilterModel): void {
        const promise = model ? this.setModelIntoUi(model) : this.resetUiToDefaults();

        promise.then(() => {
            this.updateUiVisibility();

            // we set the model from the gui, rather than the provided model,
            // so the model is consistent. eg handling of null/undefined will be the same,
            // of if model is case insensitive, then casing is removed.
            this.applyModel();
        });
    }

    private onBtCancel() {
        this.setModel(this.getModel());

        if (this.hidePopup && this.providedFilterParams.closeOnApply) {
            this.hidePopup();
            this.hidePopup = null;
        }
    }

    private onBtClear() {
        this.resetUiToDefaults().then(() => {
            this.updateUiVisibility();
            this.onUiChanged();
        });
    }

    private onBtReset() {
        this.onBtClear();
        this.onBtApply();
    }

    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    public applyModel(): boolean {
        const newModel = this.getModelFromUi();

        if (!this.isModelValid(newModel)) { return false; }

        const previousModel = this.appliedModel;

        this.appliedModel = newModel;

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(previousModel, newModel);
    }

    protected isModelValid(model: ProvidedFilterModel): boolean {
        return true;
    }

    protected onBtApply(afterFloatingFilter = false, afterDataChange = false) {
        if (this.applyModel()) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter, afterDataChange });
        }

        const { closeOnApply } = this.providedFilterParams;

        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && !afterFloatingFilter && this.hidePopup && this.applyActive) {
            this.hidePopup();
            this.hidePopup = null;
        }
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults().then(() => this.appliedModel = null);
        }
    }

    // called by set filter
    protected isNewRowsActionKeep(): boolean {
        return this.newRowsActionKeep;
    }

    protected onUiChanged(afterFloatingFilter = false): void {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();

        if (afterFloatingFilter) {
            // floating filter changes are always applied immediately
            this.onBtApply(true);
        } else if (!this.applyActive) {
            // if no apply button, we apply (but debounce for time delay)
            this.onBtApplyDebounce();
        }
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        this.hidePopup = params.hidePopup;
    }

    // static, as used by floating filter also
    public static getDebounceMs(params: IProvidedFilterParams, debounceDefault: number): number {
        if (ProvidedFilter.isUseApplyButton(params)) {
            if (params.debounceMs != null) {
                console.warn('ag-Grid: debounceMs is ignored when apply button is present');
            }

            return 0;
        }

        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    }

    // static, as used by floating filter also
    public static isUseApplyButton(params: IProvidedFilterParams): boolean {
        ProvidedFilter.checkForDeprecatedParams(params);

        return params.buttons && params.buttons.indexOf('apply') >= 0;
    }

    public destroy() {
        this.hidePopup = null;

        super.destroy();
    }
}

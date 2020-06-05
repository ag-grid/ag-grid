import { Component } from '../../widgets/component';
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { Autowired, PostConstruct } from '../../context/context';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { IRowModel } from '../../interfaces/iRowModel';
import { Constants } from '../../constants';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { loadTemplate, addCssClass, setDisabled } from '../../utils/dom';
import { debounce } from '../../utils/function';
import { Promise } from '../../utils/promise';
import { PopupEventParams } from '../../widgets/popupService';

type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';

export interface IProvidedFilterParams extends IFilterParams {
    /** @deprecated */ clearButton?: boolean;
    /** @deprecated */ resetButton?: boolean;
    /** @deprecated */ applyButton?: boolean;
    buttons?: FilterButtonType[];
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
    private hidePopup: (params: PopupEventParams) => void = null;

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

    public init(params: IFilterParams): void {
        this.setParams(params);

        this.resetUiToDefaults(true).then(() => {
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

        const addButton = (type: FilterButtonType): void => {
            let text;
            let clickListener: (e?: Event) => void;

            switch (type) {
                case 'apply':
                    text = translate('applyFilter', 'Apply Filter');
                    clickListener = (e) => this.onBtApply(false, false, e);
                    break;
                case 'clear':
                    text = translate('clearFilter', 'Clear Filter');
                    clickListener = () => this.onBtClear();
                    break;
                case 'reset':
                    text = translate('resetFilter', 'Reset Filter');
                    clickListener = () => this.onBtReset();
                    break;
                case 'cancel':
                    text = translate('cancelFilter', 'Cancel Filter');
                    clickListener = (e) => { this.onBtCancel(e); };
                    break;
                default:
                    console.warn('Unknown button type specified');
                    return;
            }

            const button = loadTemplate(/* html */
                `<button
                    type="button"
                    ref="${type}FilterButton"
                    class="ag-standard-button ag-filter-apply-panel-button">${text}</button>`);

            eButtonsPanel.appendChild(button);
            this.addManagedListener(button, 'click', clickListener);
        };

        new Set(buttons).forEach(type => addButton(type));

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

    public setModel(model: ProvidedFilterModel): Promise<void> {
        const promise = model ? this.setModelIntoUi(model) : this.resetUiToDefaults();

        return promise.then(() => {
            this.updateUiVisibility();

            // we set the model from the gui, rather than the provided model,
            // so the model is consistent. eg handling of null/undefined will be the same,
            // of if model is case insensitive, then casing is removed.
            this.applyModel();
        });
    }

    private onBtCancel(e: Event): void {
        this.setModelIntoUi(this.getModel()).then(() => {
            this.onUiChanged(false, 'prevent');

            if (this.providedFilterParams.closeOnApply) {
                this.close(e);
            }
        });
    }

    private onBtClear(): void {
        this.resetUiToDefaults().then(() => this.onUiChanged());
    }

    private onBtReset(): void {
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

    protected onBtApply(afterFloatingFilter = false, afterDataChange = false, e?: Event): void {
        if (this.applyModel()) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter, afterDataChange });
        }

        const { closeOnApply } = this.providedFilterParams;

        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && !afterFloatingFilter && this.applyActive) {
            this.close(e);
        }
    }

    public onNewRowsLoaded(): void {
        if (!this.newRowsActionKeep) {
            this.resetUiToDefaults().then(() => this.appliedModel = null);
        }
    }

    public close(e?: Event): void {
        if (!this.hidePopup) { return; }

        const keyboardEvent = e as KeyboardEvent;
        const key = keyboardEvent && keyboardEvent.key;
        let params: PopupEventParams;

        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent };
        }

        this.hidePopup(params);
        this.hidePopup = null;
    }

    // called by set filter
    protected isNewRowsActionKeep(): boolean {
        return this.newRowsActionKeep;
    }

    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(fromFloatingFilter = false, apply?: 'immediately' | 'debounce' | 'prevent'): void {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();

        if (this.applyActive) {
            const isValid = this.isModelValid(this.getModelFromUi());

            setDisabled(this.getRefElement('applyFilterButton'), !isValid);
        }

        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        } else if ((!this.applyActive && !apply) || apply === 'debounce') {
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

    public destroy(): void {
        this.hidePopup = null;

        super.destroy();
    }
}

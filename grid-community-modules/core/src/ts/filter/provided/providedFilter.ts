import { IDoesFilterPassParams, IFilter, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { Autowired, PostConstruct } from '../../context/context';
import { IRowModel } from '../../interfaces/iRowModel';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { loadTemplate, setDisabled } from '../../utils/dom';
import { debounce } from '../../utils/function';
import { AgPromise } from '../../utils/promise';
import { PopupEventParams } from '../../widgets/popupService';
import { IFilterLocaleText, IFilterTitleLocaleText, DEFAULT_FILTER_LOCALE_TEXT } from '../filterLocaleText';
import { ManagedFocusFeature } from '../../widgets/managedFocusFeature';
import { convertToSet } from '../../utils/set';
import { Component } from '../../widgets/component';
import { IRowNode } from '../../interfaces/iRowNode';
import { RefSelector } from '../../widgets/componentAnnotations';
import { PositionableFeature, ResizableStructure } from '../../rendering/features/positionableFeature';

type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';

/**
 * Parameters provided by the grid to the `init` method of a `ProvidedFilter`.
 * Do not use in `colDef.filterParams` - see `IProvidedFilterParams` instead.
 */
export type ProvidedFilterParams<TData = any> = IProvidedFilterParams & IFilterParams<TData>;

/**
 * Common parameters in `colDef.filterParams` used by all provided filters. Extended by the specific filter types.
 */
export interface IProvidedFilterParams {
    /**
     * Specifies the buttons to be shown in the filter, in the order they should be displayed in.
     * The options are:
     * 
     *  - `'apply'`: If the Apply button is present, the filter is only applied after the user hits the Apply button.
     *  - `'clear'`: The Clear button will clear the (form) details of the filter without removing any active filters on the column.
     *  - `'reset'`: The Reset button will clear the details of the filter and any active filters on that column.
     *  - `'cancel'`: The Cancel button will discard any changes that have been made to the filter in the UI, restoring the applied model.
     */
    buttons?: FilterButtonType[];
    /**
     * If the Apply button is present, the filter popup will be closed immediately when the Apply
     * or Reset button is clicked if this is set to `true`.
     * 
     * Default: `false`
     */
    closeOnApply?: boolean;
    /**
     * Overrides the default debounce time in milliseconds for the filter. Defaults are:
     * - `TextFilter` and `NumberFilter`: 500ms. (These filters have text field inputs, so a short delay before the input is formatted and the filtering applied is usually appropriate).
     * - `DateFilter` and `SetFilter`: 0ms
     */
    debounceMs?: number;
    /**
     * If set to `true`, disables controls in the filter to mutate its state. Normally this would
     * be used in conjunction with the Filter API.
     * 
     * Default: `false`
     */
    readOnly?: boolean;
}

/** Interface contract for the public aspects of the ProvidedFilter implementation(s). */
export interface IProvidedFilter extends IFilter {
    /**
     * Applies the model shown in the UI (so that `getModel()` will now return what was in the UI
     * when `applyModel()` was called).
     * @param source The source of the method call. Default 'api'.
     */
    applyModel(source?: 'api' | 'ui' | 'rowDataUpdated'): boolean;
    /**
     * Returns the filter model from the UI. If changes have been made to the UI but not yet
     * applied, this model will reflect those changes.
     */
    getModelFromUi(): any;
}

/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 */
export abstract class ProvidedFilter<M, V> extends Component implements IProvidedFilter, IFilterComp {
    // each level in the hierarchy will save params with the appropriate type for that level.
    private providedFilterParams: ProvidedFilterParams;

    private applyActive = false;
    private hidePopup: ((params: PopupEventParams) => void) | null | undefined = null;
    // a debounce of the onBtApply method
    private onBtApplyDebounce: () => void;

    // after the user hits 'apply' the model gets copied to here. this is then the model that we use for
    // all filtering. so if user changes UI but doesn't hit apply, then the UI will be out of sync with this model.
    // this is what we want, as the UI should only become the 'active' filter once it's applied. when apply is
    // inactive, this model will be in sync (following the debounce ms). if the UI is not a valid filter
    // (eg the value is missing so nothing to filter on, or for set filter all checkboxes are checked so filter
    // not active) then this appliedModel will be null/undefined.
    private appliedModel: M | null = null;

    private positionableFeature: PositionableFeature;

    @Autowired('rowModel') protected readonly rowModel: IRowModel;

    @RefSelector('eFilterBody') protected readonly eFilterBody: HTMLElement;

    constructor(private readonly filterNameKey: keyof IFilterTitleLocaleText) {
        super();
    }

    public abstract doesFilterPass(params: IDoesFilterPassParams): boolean;

    protected abstract updateUiVisibility(): void;

    protected abstract createBodyTemplate(): string;
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(silent?: boolean): AgPromise<void>;

    protected abstract setModelIntoUi(model: M): AgPromise<void>;
    protected abstract areModelsEqual(a: M, b: M): boolean;

    /** Used to get the filter type for filter models. */
    protected abstract getFilterType(): string;

    @PostConstruct
    protected postConstruct(): void {
        this.resetTemplate(); // do this first to create the DOM
        this.createManagedBean(new ManagedFocusFeature(
            this.getFocusableElement(),
            {
                handleKeyDown: this.handleKeyDown.bind(this)
            }
        ));
        this.positionableFeature = new PositionableFeature(this.getPositionableElement(), { forcePopupParentAsOffsetParent: true });
        this.createBean(this.positionableFeature);
    }

    // override
    protected handleKeyDown(e: KeyboardEvent): void { }

    public abstract getModelFromUi(): M | null;

    public getFilterTitle(): string {
        return this.translate(this.filterNameKey);
    }

    public isFilterActive(): boolean {
        // filter is active if we have a valid applied model
        return !!this.appliedModel;
    }

    protected resetTemplate(paramsMap?: any) {
        let eGui = this.getGui();
        if (eGui) {
            eGui.removeEventListener('submit', this.onFormSubmit);
        }
        const templateString = /* html */`
            <form class="ag-filter-wrapper">
                <div class="ag-filter-body-wrapper ag-${this.getCssIdentifier()}-body-wrapper" ref="eFilterBody">
                    ${this.createBodyTemplate()}
                </div>
            </form>`;

        this.setTemplate(templateString, paramsMap);

        eGui = this.getGui();
        if (eGui) {
            eGui.addEventListener('submit', this.onFormSubmit);
        }
    }

    protected isReadOnly(): boolean {
        return !!this.providedFilterParams.readOnly;
    }

    public init(params: ProvidedFilterParams): void {
        this.setParams(params);

        this.resetUiToDefaults(true).then(() => {
            this.updateUiVisibility();
            this.setupOnBtApplyDebounce();
        });
    }

    protected setParams(params: ProvidedFilterParams): void {
        this.providedFilterParams = params;

        this.applyActive = ProvidedFilter.isUseApplyButton(params);

        this.createButtonPanel();
    }

    private createButtonPanel(): void {
        const { buttons } = this.providedFilterParams;

        if (!buttons || buttons.length < 1 || this.isReadOnly()) {
            return;
        }

        const eButtonsPanel = document.createElement('div');

        eButtonsPanel.classList.add('ag-filter-apply-panel');

        const addButton = (type: FilterButtonType): void => {
            let text;
            let clickListener: (e?: Event) => void;

            switch (type) {
                case 'apply':
                    text = this.translate('applyFilter');
                    clickListener = (e) => this.onBtApply(false, false, e);
                    break;
                case 'clear':
                    text = this.translate('clearFilter');
                    clickListener = () => this.onBtClear();
                    break;
                case 'reset':
                    text = this.translate('resetFilter');
                    clickListener = () => this.onBtReset();
                    break;
                case 'cancel':
                    text = this.translate('cancelFilter');
                    clickListener = (e) => { this.onBtCancel(e!); };
                    break;
                default:
                    console.warn('AG Grid: Unknown button type specified');
                    return;
            }

            const buttonType = type === 'apply' ? 'submit' : 'button';
            const button = loadTemplate(
                /* html */
                `<button
                    type="${buttonType}"
                    ref="${type}FilterButton"
                    class="ag-standard-button ag-filter-apply-panel-button"
                >${text}
                </button>`
            );

            eButtonsPanel.appendChild(button);
            this.addManagedListener(button, 'click', clickListener);
        };

        convertToSet(buttons).forEach(type => addButton(type));

        this.getGui().appendChild(eButtonsPanel);
    }

    // subclasses can override this to provide alternative debounce defaults
    protected getDefaultDebounceMs(): number {
        return 0;
    }

    private setupOnBtApplyDebounce(): void {
        const debounceMs = ProvidedFilter.getDebounceMs(this.providedFilterParams, this.getDefaultDebounceMs());
        this.onBtApplyDebounce = debounce(this.onBtApply.bind(this), debounceMs);
    }

    public getModel(): M | null {
        return this.appliedModel ? this.appliedModel : null;
    }

    public setModel(model: M | null): AgPromise<void> {
        const promise = model != null ? this.setModelIntoUi(model) : this.resetUiToDefaults();

        return promise.then(() => {
            this.updateUiVisibility();

            // we set the model from the GUI, rather than the provided model,
            // so the model is consistent, e.g. handling of null/undefined will be the same,
            // or if model is case insensitive, then casing is removed.
            this.applyModel('api');
        });
    }

    private onBtCancel(e: Event): void {
        const currentModel = this.getModel();

        const afterAppliedFunc = () => {
            this.onUiChanged(false, 'prevent');

            if (this.providedFilterParams.closeOnApply) {
                this.close(e);
            }
        };

        if (currentModel != null) {
            this.setModelIntoUi(currentModel).then(afterAppliedFunc);
        } else {
            this.resetUiToDefaults().then(afterAppliedFunc);
        }
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
    public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        const newModel = this.getModelFromUi();

        if (!this.isModelValid(newModel!)) { return false; }

        const previousModel = this.appliedModel;

        this.appliedModel = newModel;

        // models can be same if user pasted same content into text field, or maybe just changed the case
        // and it's a case insensitive filter
        return !this.areModelsEqual(previousModel!, newModel!);
    }

    protected isModelValid(model: M): boolean {
        return true;
    }

    private onFormSubmit(e: Event): void {
        e.preventDefault();
    }

    protected onBtApply(afterFloatingFilter = false, afterDataChange = false, e?: Event): void {
        // Prevent form submission
        if (e) { e.preventDefault(); }
        if (this.applyModel(afterDataChange ? 'rowDataUpdated' : 'ui')) {
            // the floating filter uses 'afterFloatingFilter' info, so it doesn't refresh after filter changed if change
            // came from floating filter
            this.providedFilterParams.filterChangedCallback({ afterFloatingFilter, afterDataChange });
        }

        const { closeOnApply } = this.providedFilterParams;

        // only close if an apply button is visible, otherwise we'd be closing every time a change was made!
        if (closeOnApply && this.applyActive && !afterFloatingFilter && !afterDataChange) {
            this.close(e);
        }
    }

    public onNewRowsLoaded(): void {
    }

    public close(e?: Event): void {
        if (!this.hidePopup) { return; }

        const keyboardEvent = e as KeyboardEvent;
        const key = keyboardEvent && keyboardEvent.key;
        let params: PopupEventParams;

        if (key === 'Enter' || key === 'Space') {
            params = { keyboardEvent };
        }

        this.hidePopup(params!);
        this.hidePopup = null;
    }

    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(fromFloatingFilter = false, apply?: 'immediately' | 'debounce' | 'prevent'): void {
        this.updateUiVisibility();
        this.providedFilterParams.filterModifiedCallback();

        if (this.applyActive && !this.isReadOnly()) {
            const isValid = this.isModelValid(this.getModelFromUi()!);

            setDisabled(this.getRefElement('applyFilterButton'), !isValid);
        }

        if ((fromFloatingFilter && !apply) || apply === 'immediately') {
            this.onBtApply(fromFloatingFilter);
        } else if ((!this.applyActive && !apply) || apply === 'debounce') {
            this.onBtApplyDebounce();
        }
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params?.container === 'floatingFilter') {
            this.positionableFeature.restoreLastSize();
            this.positionableFeature.setResizable(this.getResizableStructure());
        } else {
            this.positionableFeature.removeSizeFromEl();
            this.positionableFeature.setResizable(false);
        }

        if (params == null) { return; }

        this.hidePopup = params.hidePopup;
    }

    // static, as used by floating filter also
    public static getDebounceMs(params: ProvidedFilterParams, debounceDefault: number): number {
        if (ProvidedFilter.isUseApplyButton(params)) {
            if (params.debounceMs != null) {
                console.warn('AG Grid: debounceMs is ignored when apply button is present');
            }

            return 0;
        }

        return params.debounceMs != null ? params.debounceMs : debounceDefault;
    }

    // static, as used by floating filter also
    public static isUseApplyButton(params: ProvidedFilterParams): boolean {
        return !!params.buttons && params.buttons.indexOf('apply') >= 0;
    }

    public destroy(): void {
        const eGui = this.getGui();
        if (eGui) {
            eGui.removeEventListener('submit', this.onFormSubmit);
        }
        this.hidePopup = null;

        super.destroy();
    }

    protected translate(key: keyof IFilterLocaleText | keyof IFilterTitleLocaleText): string {
        const translate = this.localeService.getLocaleTextFunc();

        return translate(key, DEFAULT_FILTER_LOCALE_TEXT[key]);
    }

    protected getCellValue(rowNode: IRowNode): V {
        const { api, colDef, column, columnApi, context } = this.providedFilterParams;
        return this.providedFilterParams.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: rowNode.data,
            getValue: (field) => rowNode.data[field],
            node: rowNode,
        });
    }

    // override to control positionable feature
    protected getPositionableElement(): HTMLElement {
        return this.eFilterBody;
    }
    
    // override to control positionable feature
    protected getResizableStructure(): ResizableStructure {
        return {
            bottom: true
        };
    }
}

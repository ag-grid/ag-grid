import { IDoesFilterPassParams, IFilter, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { IRowModel } from '../../interfaces/iRowModel';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { AgPromise } from '../../utils/promise';
import { FILTER_LOCALE_TEXT } from '../filterLocaleText';
import { Component } from '../../widgets/component';
import { IRowNode } from '../../interfaces/iRowNode';
declare type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';
/**
 * Parameters provided by the grid to the `init` method of a `ProvidedFilter`.
 * Do not use in `colDef.filterParams` - see `IProvidedFilterParams` instead.
 */
export declare type ProvidedFilterParams<TData = any> = IProvidedFilterParams & IFilterParams<TData>;
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
     * @default false
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
     * @default false
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
export declare abstract class ProvidedFilter<M, V> extends Component implements IProvidedFilter, IFilterComp {
    private readonly filterNameKey;
    private providedFilterParams;
    private applyActive;
    private hidePopup;
    private onBtApplyDebounce;
    private debouncePending;
    private appliedModel;
    private positionableFeature;
    protected readonly rowModel: IRowModel;
    protected readonly eFilterBody: HTMLElement;
    private eButtonsPanel;
    private buttonListeners;
    constructor(filterNameKey: keyof typeof FILTER_LOCALE_TEXT);
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected abstract updateUiVisibility(): void;
    protected abstract createBodyTemplate(): string;
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(silent?: boolean): AgPromise<void>;
    protected abstract setModelIntoUi(model: M): AgPromise<void>;
    protected abstract areModelsEqual(a: M, b: M): boolean;
    /** Used to get the filter type for filter models. */
    protected abstract getFilterType(): string;
    protected postConstruct(): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    abstract getModelFromUi(): M | null;
    getFilterTitle(): string;
    isFilterActive(): boolean;
    protected resetTemplate(paramsMap?: any): void;
    protected isReadOnly(): boolean;
    init(params: ProvidedFilterParams): void;
    protected setParams(params: ProvidedFilterParams): void;
    protected updateParams(params: ProvidedFilterParams): void;
    private resetButtonsPanel;
    protected getDefaultDebounceMs(): number;
    private setupOnBtApplyDebounce;
    private checkApplyDebounce;
    getModel(): M | null;
    setModel(model: M | null): AgPromise<void>;
    private onBtCancel;
    protected handleCancelEnd(e: Event): void;
    protected resetUiToActiveModel(currentModel: M | null, afterUiUpdatedFunc?: () => void): void;
    private onBtClear;
    private onBtReset;
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    applyModel(source?: 'api' | 'ui' | 'rowDataUpdated'): boolean;
    protected isModelValid(model: M): boolean;
    private onFormSubmit;
    protected onBtApply(afterFloatingFilter?: boolean, afterDataChange?: boolean, e?: Event): void;
    onNewRowsLoaded(): void;
    close(e?: Event): void;
    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(fromFloatingFilter?: boolean, apply?: 'immediately' | 'debounce' | 'prevent'): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    private refreshFilterResizer;
    afterGuiDetached(): void;
    static getDebounceMs(params: ProvidedFilterParams, debounceDefault: number): number;
    static isUseApplyButton(params: ProvidedFilterParams): boolean;
    refresh(newParams: ProvidedFilterParams): boolean;
    destroy(): void;
    protected translate(key: keyof typeof FILTER_LOCALE_TEXT): string;
    protected getCellValue(rowNode: IRowNode): V | null | undefined;
    protected getPositionableElement(): HTMLElement;
}
export {};

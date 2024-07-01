import type { BeanCollection } from '../../context/context';
import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import type { IDoesFilterPassParams, IFilterComp } from '../../interfaces/iFilter';
import type { IRowModel } from '../../interfaces/iRowModel';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import { FILTER_LOCALE_TEXT } from '../filterLocaleText';
import type { IProvidedFilter, ProvidedFilterParams } from './iProvidedFilter';
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
    protected rowModel: IRowModel;
    wireBeans(beans: BeanCollection): void;
    protected readonly eFilterBody: HTMLElement;
    private eButtonsPanel;
    private buttonListeners;
    constructor(filterNameKey: keyof typeof FILTER_LOCALE_TEXT);
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected abstract updateUiVisibility(): void;
    protected abstract createBodyTemplate(): string;
    protected abstract getAgComponents(): ComponentSelector[];
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(silent?: boolean): AgPromise<void>;
    protected abstract setModelIntoUi(model: M): AgPromise<void>;
    protected abstract areModelsEqual(a: M, b: M): boolean;
    /** Used to get the filter type for filter models. */
    protected abstract getFilterType(): string;
    postConstruct(): void;
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
    refresh(newParams: ProvidedFilterParams): boolean;
    destroy(): void;
    protected translate(key: keyof typeof FILTER_LOCALE_TEXT): string;
    protected getCellValue(rowNode: IRowNode): V | null | undefined;
    protected getPositionableElement(): HTMLElement;
}

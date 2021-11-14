import { IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { IRowModel } from '../../interfaces/iRowModel';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { AgPromise } from '../../utils/promise';
import { IFilterLocaleText, IFilterTitleLocaleText } from '../filterLocaleText';
import { Component } from '../../widgets/component';
import { RowNode } from '../../entities/rowNode';
declare type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';
export interface IProvidedFilterParams extends IFilterParams {
    /** @deprecated */ clearButton?: boolean;
    /** @deprecated */ resetButton?: boolean;
    /** @deprecated */ applyButton?: boolean;
    buttons?: FilterButtonType[];
    closeOnApply?: boolean;
    /** @deprecated */ newRowsAction?: string;
    debounceMs?: number;
    /** Defaults to false. If true, all UI inputs related to this filter are for display only, and
     * the filter can only be affected by API calls. */
    readOnly?: boolean;
}
/**
 * Contains common logic to all provided filters (apply button, clear button, etc).
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 */
export declare abstract class ProvidedFilter<M, V> extends Component implements IFilterComp {
    private readonly filterNameKey;
    private newRowsActionKeep;
    private providedFilterParams;
    private applyActive;
    private hidePopup;
    private onBtApplyDebounce;
    private appliedModel;
    protected readonly rowModel: IRowModel;
    constructor(filterNameKey: keyof IFilterTitleLocaleText);
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
    /** @deprecated */
    onFilterChanged(): void;
    isFilterActive(): boolean;
    protected resetTemplate(paramsMap?: any): void;
    protected isReadOnly(): boolean;
    init(params: IProvidedFilterParams): void;
    protected setParams(params: IProvidedFilterParams): void;
    private createButtonPanel;
    private static checkForDeprecatedParams;
    protected getDefaultDebounceMs(): number;
    private setupOnBtApplyDebounce;
    getModel(): M | null;
    setModel(model: M | null): AgPromise<void>;
    private onBtCancel;
    private onBtClear;
    private onBtReset;
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    applyModel(): boolean;
    protected isModelValid(model: M): boolean;
    protected onBtApply(afterFloatingFilter?: boolean, afterDataChange?: boolean, e?: Event): void;
    onNewRowsLoaded(): void;
    close(e?: Event): void;
    protected isNewRowsActionKeep(): boolean;
    /**
     * By default, if the change came from a floating filter it will be applied immediately, otherwise if there is no
     * apply button it will be applied after a debounce, otherwise it will not be applied at all. This behaviour can
     * be adjusted by using the apply parameter.
     */
    protected onUiChanged(fromFloatingFilter?: boolean, apply?: 'immediately' | 'debounce' | 'prevent'): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    static getDebounceMs(params: IProvidedFilterParams, debounceDefault: number): number;
    static isUseApplyButton(params: IProvidedFilterParams): boolean;
    destroy(): void;
    protected translate(key: keyof IFilterLocaleText | keyof IFilterTitleLocaleText): string;
    protected getCellValue(rowNode: RowNode): V;
}
export {};

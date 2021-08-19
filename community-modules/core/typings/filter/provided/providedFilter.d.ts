import { IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { IRowModel } from '../../interfaces/iRowModel';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { AgPromise } from '../../utils/promise';
import { IFilterLocaleText, IFilterTitleLocaleText } from '../filterLocaleText';
import { Component } from '../../widgets/component';
declare type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';
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
 * All the filters that come with AG Grid extend this class. User filters do not
 * extend this class.
 */
export declare abstract class ProvidedFilter<T> extends Component implements IFilterComp {
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
    protected abstract setModelIntoUi(model: T): AgPromise<void>;
    protected abstract areModelsEqual(a: T, b: T): boolean;
    /** Used to get the filter type for filter models. */
    protected abstract getFilterType(): string;
    protected postConstruct(): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    abstract getModelFromUi(): T | null;
    getFilterTitle(): string;
    /** @deprecated */
    onFilterChanged(): void;
    isFilterActive(): boolean;
    protected resetTemplate(paramsMap?: any): void;
    init(params: IProvidedFilterParams): void;
    protected setParams(params: IProvidedFilterParams): void;
    private createButtonPanel;
    private static checkForDeprecatedParams;
    protected getDefaultDebounceMs(): number;
    private setupOnBtApplyDebounce;
    getModel(): T | null;
    setModel(model: T | null): AgPromise<void>;
    private onBtCancel;
    private onBtClear;
    private onBtReset;
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    applyModel(): boolean;
    protected isModelValid(model: T): boolean;
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
}
export {};

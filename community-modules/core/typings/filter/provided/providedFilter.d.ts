import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from '../../interfaces/iFilter';
import { GridOptionsWrapper } from '../../gridOptionsWrapper';
import { IRowModel } from '../../interfaces/iRowModel';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { Promise } from '../../utils/promise';
import { IFilterLocaleText, IFilterTitleLocaleText } from '../filterLocaleText';
import { ManagedFocusComponent } from '../../widgets/managedFocusComponent';
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
 * All the filters that come with ag-Grid extend this class. User filters do not
 * extend this class.
 */
export declare abstract class ProvidedFilter extends ManagedFocusComponent implements IFilterComp {
    private readonly filterNameKey;
    private newRowsActionKeep;
    private providedFilterParams;
    private applyActive;
    private hidePopup;
    private onBtApplyDebounce;
    private appliedModel;
    protected readonly gridOptionsWrapper: GridOptionsWrapper;
    protected readonly rowModel: IRowModel;
    constructor(filterNameKey: keyof IFilterTitleLocaleText);
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected abstract updateUiVisibility(): void;
    protected abstract createBodyTemplate(): string;
    protected abstract getCssIdentifier(): string;
    protected abstract resetUiToDefaults(silent?: boolean): Promise<void>;
    protected abstract setModelIntoUi(model: ProvidedFilterModel): Promise<void>;
    protected abstract areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean;
    /** Used to get the filter type for filter models. */
    protected abstract getFilterType(): string;
    abstract getModelFromUi(): ProvidedFilterModel | null;
    getFilterTitle(): string;
    /** @deprecated */
    onFilterChanged(): void;
    isFilterActive(): boolean;
    protected postConstruct(): void;
    protected resetTemplate(paramsMap?: any): void;
    init(params: IProvidedFilterParams): void;
    protected setParams(params: IProvidedFilterParams): void;
    private createButtonPanel;
    private static checkForDeprecatedParams;
    protected getDefaultDebounceMs(): number;
    private setupOnBtApplyDebounce;
    getModel(): ProvidedFilterModel;
    setModel(model: ProvidedFilterModel): Promise<void>;
    private onBtCancel;
    private onBtClear;
    private onBtReset;
    /**
     * Applies changes made in the UI to the filter, and returns true if the model has changed.
     */
    applyModel(): boolean;
    protected isModelValid(model: ProvidedFilterModel): boolean;
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

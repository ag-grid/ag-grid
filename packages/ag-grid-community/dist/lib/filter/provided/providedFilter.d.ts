import { Component } from "../../widgets/component";
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterComp, IFilterParams } from "../../interfaces/iFilter";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { IRowModel } from "../../interfaces/iRowModel";
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
export declare abstract class ProvidedFilter extends Component implements IFilterComp {
    private static NEW_ROWS_ACTION_KEEP;
    private static NEW_ROWS_ACTION_CLEAR;
    private newRowsActionKeep;
    private providedFilterParams;
    private applyActive;
    private eButtonsPanel;
    protected eFilterBodyWrapper: HTMLElement;
    private eClearButton;
    private eResetButton;
    private eApplyButton;
    protected gridOptionsWrapper: GridOptionsWrapper;
    protected rowModel: IRowModel;
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected abstract updateUiVisibility(): void;
    protected abstract createBodyTemplate(): string;
    protected abstract resetUiToDefaults(): void;
    protected abstract setModelIntoUi(model: ProvidedFilterModel): void;
    protected abstract areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean;
    abstract getModelFromUi(): ProvidedFilterModel | null;
    private appliedModel;
    private onBtApplyDebounce;
    /** @deprecated */
    onFilterChanged(): void;
    isFilterActive(): boolean;
    protected postConstruct(): void;
    init(params: IFilterParams): void;
    protected setParams(params: IProvidedFilterParams): void;
    protected getDefaultDebounceMs(): number;
    private setupOnBtApplyDebounce;
    getModel(): ProvidedFilterModel;
    setModel(model: ProvidedFilterModel): void;
    private onBtClear;
    private onBtReset;
    applyModel(): boolean;
    private onBtApply;
    onNewRowsLoaded(): void;
    protected isNewRowsActionKeep(): boolean;
    protected onUiChanged(afterFloatingFilter?: boolean): void;
    private createTemplate;
    static getDebounceMs(params: IProvidedFilterParams, debounceDefault: number): number;
    static isUseApplyButton(params: IProvidedFilterParams): boolean;
}

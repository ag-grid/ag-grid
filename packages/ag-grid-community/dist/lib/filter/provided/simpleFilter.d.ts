// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ProvidedFilterModel, IDoesFilterPassParams, IFilterOptionDef } from "../../interfaces/iFilter";
import { OptionsFactory } from "./optionsFactory";
import { ProvidedFilter, IProvidedFilterParams } from "./providedFilter";
export interface ISimpleFilterParams extends IProvidedFilterParams {
    filterOptions?: (IFilterOptionDef | string)[];
    defaultOption?: string;
    suppressAndOrCondition?: boolean;
}
export interface ISimpleFilterModel extends ProvidedFilterModel {
    type: string;
}
export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: string;
    condition1: M;
    condition2: M;
}
export declare enum ConditionPosition {
    One = 0,
    Two = 1
}
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export declare abstract class SimpleFilter<M extends ISimpleFilterModel> extends ProvidedFilter {
    static EMPTY: string;
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN: string;
    static LESS_THAN_OR_EQUAL: string;
    static GREATER_THAN: string;
    static GREATER_THAN_OR_EQUAL: string;
    static IN_RANGE: string;
    static CONTAINS: string;
    static NOT_CONTAINS: string;
    static STARTS_WITH: string;
    static ENDS_WITH: string;
    private eType1;
    private eType2;
    private eJoinOperatorAnd;
    private eJoinOperatorOr;
    private eCondition2Body;
    private eJoinOperatorPanel;
    private allowTwoConditions;
    private simpleFilterParams;
    protected optionsFactory: OptionsFactory;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract createValueTemplate(position: ConditionPosition): string;
    protected abstract individualConditionPasses(params: IDoesFilterPassParams, type: ISimpleFilterModel): boolean;
    protected abstract isConditionUiComplete(position: ConditionPosition): boolean;
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;
    protected abstract getFilterType(): string;
    protected abstract setValueFromFloatingFilter(value: string): void;
    protected abstract createCondition(position: ConditionPosition): M;
    protected abstract setConditionIntoUi(model: ISimpleFilterModel, position: ConditionPosition): void;
    protected showValueFrom(type: string): boolean;
    protected showValueTo(type: string): boolean;
    onFloatingFilterChanged(type: string, value: any): void;
    protected setTypeFromFloatingFilter(type: string): void;
    protected getModelFromUi(): M | ICombinedSimpleModel<M>;
    protected getCondition1Type(): string;
    protected getCondition2Type(): string;
    protected getJoinOperator(): string;
    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean;
    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): void;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected setParams(params: ISimpleFilterParams): void;
    private putOptionsIntoDropdown;
    isAllowTwoConditions(): boolean;
    protected createBodyTemplate(): string;
    protected updateUiVisibility(): void;
    protected resetUiToDefaults(): void;
    translate(toTranslate: string): string;
    addChangedListeners(): void;
    protected doesFilterHaveHiddenInput(filterType: string): boolean;
}

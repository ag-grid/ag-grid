import { IDoesFilterPassParams, IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
export declare type JoinOperator = 'AND' | 'OR';
export interface ISimpleFilterParams extends IProvidedFilterParams {
    filterOptions?: (IFilterOptionDef | string)[];
    defaultOption?: string;
    defaultJoinOperator?: JoinOperator;
    suppressAndOrCondition?: boolean;
    alwaysShowBothConditions?: boolean;
}
export interface ISimpleFilterModel extends ProvidedFilterModel {
    type?: string | null;
}
export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: JoinOperator;
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
export declare abstract class SimpleFilter<M extends ISimpleFilterModel> extends ProvidedFilter<M | ICombinedSimpleModel<M>> {
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
    protected readonly eType1: AgSelect;
    protected readonly eType2: AgSelect;
    protected readonly eJoinOperatorPanel: HTMLElement;
    protected readonly eJoinOperatorAnd: AgRadioButton;
    protected readonly eJoinOperatorOr: AgRadioButton;
    protected readonly eCondition1Body: HTMLElement;
    protected readonly eCondition2Body: HTMLElement;
    private allowTwoConditions;
    private alwaysShowBothConditions;
    private defaultJoinOperator;
    protected optionsFactory: OptionsFactory;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract createValueTemplate(position: ConditionPosition): string;
    protected abstract individualConditionPasses(params: IDoesFilterPassParams, type: ISimpleFilterModel): boolean;
    protected abstract isConditionUiComplete(position: ConditionPosition): boolean;
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;
    protected abstract setValueFromFloatingFilter(value: string): void;
    protected abstract createCondition(position: ConditionPosition): M;
    protected abstract setConditionIntoUi(model: ISimpleFilterModel | null, position: ConditionPosition): void;
    protected showValueFrom(type?: string | null): boolean;
    protected showValueTo(type?: string | null): boolean;
    onFloatingFilterChanged(type: string | null | undefined, value: any): void;
    protected setTypeFromFloatingFilter(type?: string | null): void;
    getModelFromUi(): M | ICombinedSimpleModel<M> | null;
    protected getCondition1Type(): string | null | undefined;
    protected getCondition2Type(): string | null | undefined;
    protected getJoinOperator(): JoinOperator;
    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean;
    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): AgPromise<void>;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected setParams(params: ISimpleFilterParams): void;
    private getDefaultJoinOperator;
    private putOptionsIntoDropdown;
    isAllowTwoConditions(): boolean;
    protected createBodyTemplate(): string;
    protected getCssIdentifier(): string;
    protected updateUiVisibility(): void;
    protected isCondition2Enabled(): boolean;
    protected resetUiToDefaults(silent?: boolean): AgPromise<void>;
    private isDefaultOperator;
    private addChangedListeners;
    protected doesFilterHaveHiddenInput(filterType?: string | null): boolean | undefined;
}

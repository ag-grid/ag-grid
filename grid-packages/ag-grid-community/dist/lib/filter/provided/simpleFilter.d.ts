import { IDoesFilterPassParams, IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
export declare type JoinOperator = 'AND' | 'OR';
export interface ISimpleFilterParams extends IProvidedFilterParams {
    /**
     * Array of filter options to present to the user. See [Filter Options](/filter-provided-simple/#simple-filter-options) for all options available to each filter type.
     */
    filterOptions?: (IFilterOptionDef | string)[];
    /** The default filter option to be selected. */
    defaultOption?: string;
    /**
     * By default, the two conditions are combined using `AND`.
     * You can change this default by setting this property.
     * Options: `AND`, `OR`
     */
    defaultJoinOperator?: JoinOperator;
    /**
     * If `true`, the filter will only allow one condition.
     * Default: `false`
     */
    suppressAndOrCondition?: boolean;
    /**
     * By default, only one condition is shown, and a second is made visible once a first condition has been entered.
     * Set this to `true` to always show both conditions.
     * In this case the second condition will be disabled until a first condition has been entered.
     * Default: `false`
     */
    alwaysShowBothConditions?: boolean;
}
export declare type ISimpleFilterModelType = 'empty' | 'equals' | 'notEqual' | 'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'inRange' | 'contains' | 'notContains' | 'startsWith' | 'endsWith';
export interface ISimpleFilterModel extends ProvidedFilterModel {
    /** One of the filter options, e.g. `'equals'` */
    type?: ISimpleFilterModelType | null;
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
export declare type Tuple<T> = (T | null)[];
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
export declare abstract class SimpleFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends ProvidedFilter<M | ICombinedSimpleModel<M>, V> {
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
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;
    protected abstract createCondition(position: ConditionPosition): M;
    protected abstract mapValuesFromModel(filterModel: ISimpleFilterModel | null): Tuple<V>;
    protected abstract evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;
    protected abstract evaluateNonNullValue(range: Tuple<V>, cellValue: V, filterModel: M): boolean;
    protected abstract getInputs(): Tuple<E>[];
    protected abstract getValues(position: ConditionPosition): Tuple<V>;
    protected getNumberOfInputs(type?: string | null): number;
    onFloatingFilterChanged(type: string | null | undefined, value: V | null): void;
    protected setTypeFromFloatingFilter(type?: string | null): void;
    getModelFromUi(): M | ICombinedSimpleModel<M> | null;
    protected getConditionTypes(): Tuple<ISimpleFilterModelType>;
    protected getJoinOperator(): JoinOperator;
    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean;
    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): AgPromise<void>;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected setParams(params: ISimpleFilterParams): void;
    private getDefaultJoinOperator;
    private putOptionsIntoDropdown;
    private createBoilerplateListOption;
    private createCustomListOption;
    isAllowTwoConditions(): boolean;
    protected createBodyTemplate(): string;
    protected getCssIdentifier(): string;
    protected updateUiVisibility(): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    protected resetPlaceholder(): void;
    protected setElementValue(element: E, value: V | null, silent?: boolean): void;
    protected setElementDisplayed(element: E, displayed: boolean): void;
    protected setElementDisabled(element: E, disabled: boolean): void;
    protected attachElementOnChange(element: E, listener: () => void): void;
    protected forEachInput(cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void;
    protected isConditionVisible(position: ConditionPosition): boolean;
    protected isConditionDisabled(position: ConditionPosition): boolean;
    protected isConditionBodyVisible(position: ConditionPosition): boolean;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected resetUiToDefaults(silent?: boolean): AgPromise<void>;
    protected setConditionIntoUi(model: M | null, position: ConditionPosition): void;
    protected setValueFromFloatingFilter(value: V | null): void;
    private isDefaultOperator;
    private addChangedListeners;
    /** returns true if the row passes the said condition */
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: M): boolean;
    protected evaluateCustomFilter(customFilterOption: IFilterOptionDef | undefined, values: Tuple<V>, cellValue: V): boolean | undefined;
}

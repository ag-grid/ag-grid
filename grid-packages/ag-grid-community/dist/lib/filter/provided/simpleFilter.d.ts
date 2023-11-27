import { IDoesFilterPassParams, IFilterOptionDef, IFilterParams, ProvidedFilterModel } from '../../interfaces/iFilter';
import { OptionsFactory } from './optionsFactory';
import { IProvidedFilter, IProvidedFilterParams, ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { Component } from '../../widgets/component';
import { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { IFloatingFilterParent } from '../floating/floatingFilter';
import { LocaleService } from '../../localeService';
export declare type JoinOperator = 'AND' | 'OR';
/** Interface contract for the public aspects of the SimpleFilter implementation(s). */
export interface ISimpleFilter extends IProvidedFilter, IFloatingFilterParent {
}
export interface IFilterPlaceholderFunctionParams {
    /**
     * The filter option key
     */
    filterOptionKey: ISimpleFilterModelType;
    /**
     * The filter option name as localised text
     */
    filterOption: string;
    /**
     * The default placeholder text
     */
    placeholder: string;
}
export declare type FilterPlaceholderFunction = (params: IFilterPlaceholderFunctionParams) => string;
/**
 * Parameters provided by the grid to the `init` method of a `SimpleFilter`.
 * Do not use in `colDef.filterParams` - see `ISimpleFilterParams` instead.
 */
export declare type SimpleFilterParams<TData = any> = ISimpleFilterParams & IFilterParams<TData>;
/**
 * Common parameters in `colDef.filterParams` used by all simple filters. Extended by the specific filter types.
 */
export interface ISimpleFilterParams extends IProvidedFilterParams {
    /**
     * Array of filter options to present to the user.
     */
    filterOptions?: (IFilterOptionDef | ISimpleFilterModelType)[];
    /** The default filter option to be selected. */
    defaultOption?: string;
    /**
     * By default, the two conditions are combined using `AND`.
     * You can change this default by setting this property.
     * Options: `AND`, `OR`
     */
    defaultJoinOperator?: JoinOperator;
    /**
     * Maximum number of conditions allowed in the filter.
     *
     * @default 2
     */
    maxNumConditions?: number;
    /**
     * By default only one condition is shown, and additional conditions are made visible when the previous conditions are entered
     * (up to `maxNumConditions`). To have more conditions shown by default, set this to the number required.
     * Conditions will be disabled until the previous conditions have been entered.
     * Note that this cannot be greater than `maxNumConditions` - anything larger will be ignored.
     *
     * @default 1
     */
    numAlwaysVisibleConditions?: number;
    /**
     * @deprecated As of v29.2 there can be more than two conditions in the filter. Use `maxNumConditions = 1` instead.
     */
    suppressAndOrCondition?: boolean;
    /**
     * @deprecated As of v29.2 there can be more than two conditions in the filter. Use `numAlwaysVisibleConditions = 2` instead.
     */
    alwaysShowBothConditions?: boolean;
    /**
     * Placeholder text for the filter textbox
     */
    filterPlaceholder?: FilterPlaceholderFunction | string;
}
export declare type ISimpleFilterModelType = 'empty' | 'equals' | 'notEqual' | 'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'inRange' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'blank' | 'notBlank';
export interface ISimpleFilterModel extends ProvidedFilterModel {
    /** One of the filter options, e.g. `'equals'` */
    type?: ISimpleFilterModelType | null;
}
/**
 * Old combined models prior to v29.2 only supported two conditions, which were defined using `condition1` and `condition2`.
 * New combined models allow more than two conditions using `conditions`.
 * When supplying combined models to the grid:
 * - `conditions` will be used if present.
 * - If `conditions` is not present, `condition1` and `condition2` will be used (deprecated).
 *
 * When receiving combined models from the grid:
 * - `conditions` will be populated with all the conditions (including the first and second conditions).
 * - `condition1` and `condition2` will be populated with the first and second conditions (deprecated).
 */
export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: JoinOperator;
    /** @deprecated As of v29.2, supply as the first element of `conditions`. */
    condition1: M;
    /** @deprecated As of v29.2, supply as the second element of `conditions`. */
    condition2: M;
    /** Will be mandatory in a future release. */
    conditions?: M[];
}
export declare type Tuple<T> = (T | null)[];
export declare abstract class SimpleFilterModelFormatter<TValue = any> {
    private readonly localeService;
    private optionsFactory;
    protected readonly valueFormatter?: ((value: TValue | null) => string | null) | undefined;
    constructor(localeService: LocaleService, optionsFactory: OptionsFactory, valueFormatter?: ((value: TValue | null) => string | null) | undefined);
    getModelAsString(model: ISimpleFilterModel | null): string | null;
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;
    updateParams(params: {
        optionsFactory: OptionsFactory;
    }): void;
    protected formatValue(value?: TValue | null): string;
}
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
export declare abstract class SimpleFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends ProvidedFilter<M | ICombinedSimpleModel<M>, V> implements ISimpleFilter {
    static EMPTY: ISimpleFilterModelType;
    static BLANK: ISimpleFilterModelType;
    static NOT_BLANK: ISimpleFilterModelType;
    static EQUALS: ISimpleFilterModelType;
    static NOT_EQUAL: ISimpleFilterModelType;
    static LESS_THAN: ISimpleFilterModelType;
    static LESS_THAN_OR_EQUAL: ISimpleFilterModelType;
    static GREATER_THAN: ISimpleFilterModelType;
    static GREATER_THAN_OR_EQUAL: ISimpleFilterModelType;
    static IN_RANGE: ISimpleFilterModelType;
    static CONTAINS: ISimpleFilterModelType;
    static NOT_CONTAINS: ISimpleFilterModelType;
    static STARTS_WITH: ISimpleFilterModelType;
    static ENDS_WITH: ISimpleFilterModelType;
    protected readonly eTypes: AgSelect[];
    protected readonly eJoinOperatorPanels: HTMLElement[];
    protected readonly eJoinOperatorsAnd: AgRadioButton[];
    protected readonly eJoinOperatorsOr: AgRadioButton[];
    protected readonly eConditionBodies: HTMLElement[];
    private readonly listener;
    private maxNumConditions;
    private numAlwaysVisibleConditions;
    private defaultJoinOperator;
    private filterPlaceholder;
    private lastUiCompletePosition;
    private joinOperatorId;
    private filterListOptions;
    protected optionsFactory: OptionsFactory;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract createValueElement(): HTMLElement;
    protected abstract removeValueElements(startPosition: number, deleteCount?: number): void;
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;
    protected abstract createCondition(position: number): M;
    protected abstract mapValuesFromModel(filterModel: ISimpleFilterModel | null): Tuple<V>;
    protected abstract evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;
    protected abstract evaluateNonNullValue(range: Tuple<V>, cellValue: V, filterModel: M, params: IDoesFilterPassParams): boolean;
    protected abstract getInputs(position: number): Tuple<E>;
    protected abstract getValues(position: number): Tuple<V>;
    protected getNumberOfInputs(type?: ISimpleFilterModelType | null): number;
    onFloatingFilterChanged(type: string | null | undefined, value: V | null): void;
    private setTypeFromFloatingFilter;
    getModelFromUi(): M | ICombinedSimpleModel<M> | null;
    protected getConditionTypes(): (ISimpleFilterModelType | null)[];
    protected getConditionType(position: number): ISimpleFilterModelType | null;
    protected getJoinOperator(): JoinOperator;
    protected areModelsEqual(a: M | ICombinedSimpleModel<M>, b: M | ICombinedSimpleModel<M>): boolean;
    private shouldRefresh;
    refresh(newParams: SimpleFilterParams): boolean;
    protected setModelIntoUi(model: ISimpleFilterModel | ICombinedSimpleModel<M>): AgPromise<void>;
    private validateAndUpdateConditions;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    protected setParams(params: SimpleFilterParams): void;
    private setNumConditions;
    private createOption;
    private createJoinOperatorPanel;
    private createJoinOperator;
    private getDefaultJoinOperator;
    private createFilterListOptions;
    private putOptionsIntoDropdown;
    private createBoilerplateListOption;
    private createCustomListOption;
    /**
     * @deprecated As of v29.2 filters can have more than two conditions. Check `colDef.filterParams.maxNumConditions` instead.
     */
    isAllowTwoConditions(): boolean;
    protected createBodyTemplate(): string;
    protected getCssIdentifier(): string;
    protected updateUiVisibility(): void;
    private updateNumConditions;
    private updateConditionStatusesAndValues;
    private shouldAddNewConditionAtEnd;
    private removeConditionsAndOperators;
    private removeElements;
    protected removeComponents(components: Component[], startPosition: number, deleteCount?: number): void;
    protected removeItems<T>(items: T[], startPosition: number, deleteCount?: number): T[];
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    afterGuiDetached(): void;
    private getPlaceholderText;
    protected resetPlaceholder(): void;
    protected setElementValue(element: E, value: V | null, fromFloatingFilter?: boolean): void;
    protected setElementDisplayed(element: E, displayed: boolean): void;
    protected setElementDisabled(element: E, disabled: boolean): void;
    protected attachElementOnChange(element: E, listener: () => void): void;
    protected forEachInput(cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void;
    protected forEachPositionInput(position: number, cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void;
    private forEachPositionTypeInput;
    private isConditionDisabled;
    private isConditionBodyVisible;
    protected isConditionUiComplete(position: number): boolean;
    private getNumConditions;
    private getUiCompleteConditions;
    private createMissingConditionsAndOperators;
    protected resetUiToDefaults(silent?: boolean): AgPromise<void>;
    private resetType;
    private resetJoinOperatorAnd;
    private resetJoinOperatorOr;
    private resetJoinOperator;
    private updateJoinOperatorsDisabled;
    private updateJoinOperatorDisabled;
    private resetInput;
    private setConditionIntoUi;
    private setValueFromFloatingFilter;
    private isDefaultOperator;
    private addChangedListeners;
    /** returns true if the row passes the said condition */
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: M): boolean;
    protected evaluateCustomFilter(customFilterOption: IFilterOptionDef | undefined, values: Tuple<V>, cellValue: V | null | undefined): boolean | undefined;
    protected isBlank(cellValue: V): boolean;
    protected hasInvalidInputs(): boolean;
}

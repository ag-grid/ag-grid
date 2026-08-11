import type { IFilterParams } from '../../interfaces/iFilter';
import type { IFloatingFilterParent } from '../floating/floatingFilter';
import type { IProvidedFilter, IProvidedFilterParams, ProvidedFilterModel } from './iProvidedFilter';
import type { OptionsFactory } from './optionsFactory';

export interface IFilterOptionDef {
    /** A key unique within the column's options. One that is also a built-in key replaces that option. */
    displayKey: string;
    /** Display name for the filter. Can be replaced by a locale-specific value using a `localeTextFunc`. */
    displayName: string;
    /** Custom filter logic that returns a boolean based on the `filterValues` and `cellValue`. */
    predicate: (filterValues: any[], cellValue: any) => boolean;
    /** Number of inputs to display for this option. Defaults to `1` if unspecified. */
    numberOfInputs?: 0 | 1 | 2;
}

export type JoinOperator = 'AND' | 'OR';
/** Interface contract for the public aspects of the SimpleFilter implementation(s). */

export interface ISimpleFilter extends IProvidedFilter, IFloatingFilterParent {
    readonly filterType: 'text' | 'number' | 'bigint' | 'date';
}

export interface IFilterPlaceholderFunctionParams {
    /**
     * The filter option key. A Custom Filter Option reports its `displayKey`.
     */
    filterOptionKey: FilterOptionKey;
    /**
     * The filter option name as localised text
     */
    filterOption: string;
    /**
     * The default placeholder text
     */
    placeholder: string;
}
export type FilterPlaceholderFunction = (params: IFilterPlaceholderFunctionParams) => string;

/**
 * Parameters provided by the grid to the `init` method of a `SimpleFilter`.
 * Do not use in `colDef.filterParams` - see `ISimpleFilterParams` instead.
 */
export type SimpleFilterParams<TData = any> = ISimpleFilterParams & IFilterParams<TData>;

/**
 * Common parameters in `colDef.filterParams` used by all simple filters. Extended by the specific filter types.
 */
export interface ISimpleFilterParams<
    TOptionKey extends ISimpleFilterModelType = ISimpleFilterModelType,
> extends IProvidedFilterParams {
    /**
     * Array of filter options to present to the user.
     * A built-in key this filter does not evaluate is reported, and matches no rows.
     */
    filterOptions?: (IFilterOptionDef | TOptionKey | CustomFilterOptionKey)[];
    /** The default filter option to be selected. Must be one of the offered options. */
    defaultOption?: TOptionKey | CustomFilterOptionKey;
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
     * Placeholder text for the filter textbox.
     */
    filterPlaceholder?: FilterPlaceholderFunction | string;
}

export type ISimpleFilterModelPresetType =
    | 'today'
    | 'yesterday'
    | 'tomorrow'
    | 'thisWeek'
    | 'lastWeek'
    | 'nextWeek'
    | 'thisMonth'
    | 'lastMonth'
    | 'nextMonth'
    | 'thisQuarter'
    | 'lastQuarter'
    | 'nextQuarter'
    | 'thisYear'
    | 'lastYear'
    | 'nextYear'
    | 'yearToDate'
    | 'last7Days'
    | 'last30Days'
    | 'last90Days'
    | 'last6Months'
    | 'last12Months'
    | 'last24Months';

/** The `displayKey` of a Custom Filter Option. The intersection is what keeps the built-in keys suggested. */
export type CustomFilterOptionKey = string & Record<never, never>;

/** A built-in filter option key, or the `displayKey` of a Custom Filter Option. */
export type FilterOptionKey = ISimpleFilterModelType | CustomFilterOptionKey;

/** Offered by every simple filter: they take no value, so no data type can fail to support them. */
export type CommonFilterOptionKey = 'empty' | 'blank' | 'notBlank';

/** The built-in options the Text Filter evaluates. */
export type TextFilterOptionKey =
    | CommonFilterOptionKey
    | 'equals'
    | 'notEqual'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith';

/** The built-in options the ordered filters evaluate, by comparison. */
export type ScalarFilterOptionKey =
    | CommonFilterOptionKey
    | 'equals'
    | 'notEqual'
    | 'lessThan'
    | 'lessThanOrEqual'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'inRange';

/** The comparison options, plus the relative ranges only a date can express. */
export type DateFilterOptionKey = ScalarFilterOptionKey | ISimpleFilterModelPresetType;

export type ISimpleFilterModelType = TextFilterOptionKey | DateFilterOptionKey;

export interface ISimpleFilterModel extends ProvidedFilterModel {
    /** One of the filter options, e.g. `'equals'`, or a Custom Filter Option's `displayKey`. */
    type?: FilterOptionKey | null;
}

export interface ICombinedSimpleModel<M extends ISimpleFilterModel> extends ProvidedFilterModel {
    operator: JoinOperator;
    conditions: M[];
}

export function isCombinedFilterModel<M extends ISimpleFilterModel>(
    model: M | ICombinedSimpleModel<M>
): model is ICombinedSimpleModel<M> {
    return !!(model as ICombinedSimpleModel<M>).operator;
}

export type Tuple<T> = (T | null)[];

export type MapValuesFromSimpleFilterModel<TModel extends ISimpleFilterModel, TValue> = (
    filterModel: TModel | null,
    optionsFactory: OptionsFactory
) => Tuple<TValue>;

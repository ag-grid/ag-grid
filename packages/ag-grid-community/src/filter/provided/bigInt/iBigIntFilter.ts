import type { FilterInputCallbackParams, IFilterParams } from '../../../interfaces/iFilter';
import type { IScalarFilterParams } from '../iScalarFilter';
import type {
    CustomFilterOptionKey,
    IFilterOptionDef,
    ISimpleFilterModel,
    ScalarFilterOptionKey,
} from '../iSimpleFilter';
import type { ITextInputFloatingFilterParams } from '../text/iTextFilter';

export interface BigIntFilterModel extends ISimpleFilterModel {
    /** One of the BigInt Filter's options, or a Custom Filter Option's `displayKey`. */
    type?: ScalarFilterOptionKey | CustomFilterOptionKey | null;
    /** Filter type is always `'bigint'` */
    filterType?: 'bigint';
    /**
     * The bigint value(s) associated with the filter.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to), where `filter` acts as a `from` value.
     */
    filter?: string | null;
    /**
     * Range filter `to` value.
     */
    filterTo?: string | null;
}

/**
 * Parameters provided by the grid to the `init` method of a `BigIntFilter`.
 * Do not use in `colDef.filterParams` - see `IBigIntFilterParams` instead.
 */
export type BigIntFilterParams<TData = any, TContext = any> = IBigIntFilterParams<TData, TContext> &
    IFilterParams<TData, TContext>;

/**
 * Parameters used in `colDef.filterParams` to configure a BigInt Filter (`agBigIntColumnFilter`).
 */
export interface IBigIntFilterParams<TData = any, TContext = any> extends IScalarFilterParams {
    /** Array of filter options to present to the user. */
    filterOptions?: (IFilterOptionDef | ScalarFilterOptionKey)[];
    /** The default filter option to be selected. Must be one of the offered options. */
    defaultOption?: ScalarFilterOptionKey | CustomFilterOptionKey;
    /**
     * When specified, the input field will be of type `text`, and this will be used as a regex of all the characters that are allowed to be typed.
     * It is compared against each character an edit brings in, and a keystroke, paste or drop bringing in a
     * character it does not admit is refused whole. Text committed by an IME or another composing keyboard
     * is not held to it, since a composition cannot be cancelled.
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a bigint that can be used for comparisons.
     * Must also accept a plain decimal: without a `bigintFormatter` every input renders the stored value as
     * one, and reads it back through this parser once edited.
     */
    bigintParser?: (text: string | null, params: FilterInputCallbackParams<TData, TContext>) => bigint | null;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom formatter to convert the bigint value in the filter model
     * into a string to be used in the filter input. This is the inverse of the `bigintParser`.
     */
    bigintFormatter?: (value: bigint | null, params: FilterInputCallbackParams<TData, TContext>) => string | null;
}

export interface IBigIntFloatingFilterParams extends ITextInputFloatingFilterParams {}

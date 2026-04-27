import type { IFilterParams } from '../../../interfaces/iFilter';
import type { IScalarFilterParams } from '../iScalarFilter';
import type { ISimpleFilterModel } from '../iSimpleFilter';
import type { ITextInputFloatingFilterParams } from '../text/iTextFilter';

export interface BigIntFilterModel extends ISimpleFilterModel {
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
export type BigIntFilterParams<TData = any> = IBigIntFilterParams & IFilterParams<TData>;

/**
 * Parameters used in `colDef.filterParams` to configure a BigInt Filter (`agBigIntColumnFilter`).
 */
export interface IBigIntFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match.
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a bigint that can be used for comparisons.
     */
    bigintParser?: (text: string | null) => bigint | null;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom formatter to convert the bigint value in the filter model
     * into a string to be used in the filter input. This is the inverse of the `bigintParser`.
     */
    bigintFormatter?: (value: bigint | null) => string | null;
}

export interface IBigIntFloatingFilterParams extends ITextInputFloatingFilterParams {}

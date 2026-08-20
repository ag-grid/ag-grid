import type { IFilterParams } from '../../../interfaces/iFilter';
import type { IScalarFilterParams } from '../iScalarFilter';
import type {
    CustomFilterOptionKey,
    IFilterOptionDef,
    ISimpleFilterModel,
    ScalarFilterOptionKey,
} from '../iSimpleFilter';
import type { ITextInputFloatingFilterParams } from '../text/iTextFilter';

export interface NumberFilterModel extends ISimpleFilterModel {
    /** One of the Number Filter's options, or a Custom Filter Option's `displayKey`. */
    type?: ScalarFilterOptionKey | CustomFilterOptionKey | null;
    /** Filter type is always `'number'` */
    filterType?: 'number';
    /**
     * The number value(s) associated with the filter.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to), where `filter` acts as a `from` value.
     */
    filter?: number | null;
    /**
     * Range filter `to` value.
     */
    filterTo?: number | null;
}

/**
 * Parameters provided by the grid to the `init` method of a `NumberFilter`.
 * Do not use in `colDef.filterParams` - see `INumberFilterParams` instead.
 */
export type NumberFilterParams<TData = any> = INumberFilterParams & IFilterParams<TData>;
/**
 * Parameters used in `colDef.filterParams` to configure a Number Filter (`agNumberColumnFilter`).
 */

export interface INumberFilterParams extends IScalarFilterParams {
    /** Array of filter options to present to the user. */
    filterOptions?: (IFilterOptionDef | ScalarFilterOptionKey)[];
    /** The default filter option to be selected. Must be one of the offered options. */
    defaultOption?: ScalarFilterOptionKey | CustomFilterOptionKey;
    /**
     * When specified, this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match.
     * Either this or `numberFormatter` makes the input field of type `text`, unless `filterInputType` says otherwise.
     */
    allowedCharPattern?: string;
    /**
     * The type of input used by the filter. Defaults to `text` when `allowedCharPattern` or `numberFormatter`
     * is provided, and `number` otherwise. Set it explicitly to keep a `number` input for a formatter whose
     * output a `number` input can hold, or to take a `text` input without configuring either. An
     * `allowedCharPattern` applies to either input, narrowing what a `number` input already accepts.
     * @default undefined
     */
    filterInputType?: 'text' | 'number';
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     * The Advanced Filter reads this column's operands with it only when a `numberFormatter` is provided too:
     * without one an operand is written as a plain decimal, which the default parser is what reads back.
     */
    numberParser?: (text: string | null) => number | null;
    /**
     * Provides a custom formatter to convert the number value in the filter model into a string to be used in the
     * filter input. This is the inverse of the `numberParser`. Often used alongside `allowedCharPattern`, but either
     * one on its own makes the filter use a text input, since a number input would discard the formatted text.
     */
    numberFormatter?: (value: number | null) => string | null;
}

export interface INumberFloatingFilterParams extends ITextInputFloatingFilterParams {}

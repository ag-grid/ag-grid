import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { ITextFilterParams, TextFilterModel, TextFormatter } from './iTextFilter';

/**
 * What each built-in text option means, read by the column filter's matcher and the Advanced Filter's
 * operators alike so an option cannot mean two things. By static property, never by key: this runs per row.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _TEXT_FILTER_PREDICATES = {
    contains: (value: string, filterText: string): boolean => value.includes(filterText),
    notContains: (value: string, filterText: string): boolean => !value.includes(filterText),
    equals: (value: string, filterText: string): boolean => value === filterText,
    // Loose, as it has always been: a `textFormatter` can leave a non-string on either side.
    notEqual: (value: string, filterText: string): boolean => value != filterText,
    startsWith: (value: string, filterText: string): boolean => value.startsWith(filterText),
    endsWith: (value: string, filterText: string): boolean => value.endsWith(filterText),
} as const;

const defaultFormatter: TextFormatter = (from) => from ?? null;

/** Locale-aware: the Turkish dotted and dotless I are two letters, and `toLowerCase` folds them to one. */
const defaultLowercaseFormatter: TextFormatter = (from) => (from == null ? null : from.toString().toLocaleLowerCase());

/**
 * How a text column normalises both sides before comparing, so the cell value and the filter text are always
 * put through the same one, whichever filter is asking.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getTextFormatter(filterParams: ITextFilterParams): TextFormatter {
    return filterParams.textFormatter ?? (filterParams.caseSensitive ? defaultFormatter : defaultLowercaseFormatter);
}

/**
 * What `trimInput` does to an entry, whichever filter the entry was made in.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function trimInputForFilter(value?: string | null): string | null | undefined {
    const trimmedInput = value?.trim();

    // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
    return trimmedInput === '' ? value : trimmedInput;
}

export function mapValuesFromTextFilterModel(
    filterModel: TextFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<string> {
    const { filter, filterTo, type } = filterModel || {};
    return [filter || null, filterTo || null].slice(0, getNumberOfInputs(type, optionsFactory));
}

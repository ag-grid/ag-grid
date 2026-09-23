import type { CommonFilterOptionKey, TextFilterOptionKey, Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { TextFilterModel, TextFormatter } from './iTextFilter';

/**
 * Locale-invariant, as the Quick Filter and Set Filter also fold: a locale-aware fold makes a letter fail to
 * match its own other case in Lithuanian, and differs by the viewer's browser rather than the data.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const defaultLowercaseFormatter: TextFormatter = (from: string) =>
    from == null ? null : from.toString().toLowerCase();

/**
 * The comparison each option makes, shared so the two filters cannot drift and neither carries a copy.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const TEXT_COMPARISONS: Record<
    Exclude<TextFilterOptionKey, CommonFilterOptionKey>,
    (value: string, filterText: string) => boolean
> = {
    contains: (value, filterText) => value.includes(filterText),
    notContains: (value, filterText) => !value.includes(filterText),
    equals: (value, filterText) => value === filterText,
    notEqual: (value, filterText) => value != filterText,
    startsWith: (value, filterText) => value.startsWith(filterText),
    endsWith: (value, filterText) => value.endsWith(filterText),
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

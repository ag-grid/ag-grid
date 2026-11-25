import type { LocaleTextFunc } from 'ag-stack';

import type { GridOptionsService } from '../gridOptionsService';
import { _formatNumberCommas } from '../utils/number';

export function _formatPaginationNumber(
    value: number,
    gos: GridOptionsService,
    getLocaleTextFunc: () => LocaleTextFunc
): string {
    const userFunc = gos.getCallback('paginationNumberFormatter');
    if (userFunc) {
        return userFunc({ value });
    }
    return _formatNumberCommas(value, getLocaleTextFunc);
}

type PaginationTokenName = 'first' | 'last' | 'count' | 'page' | 'total';
type PaginationTokenValues = Partial<Record<PaginationTokenName, string>>;

/** Case-insensitive so a `getLocaleText` callback that changes the case of the default keeps working. */
const PAGINATION_TOKEN_REGEX = /\$\{(first|last|count|page|total)\}/gi;

/**
 * Looks up a pagination phrase whose translation can place `${first}`, `${page}` etc. in any order.
 * The values are also passed positionally, in the order given, so a custom value written with `${variable}` still fills.
 */
export function _getPaginationTemplate(
    localeTextFunc: LocaleTextFunc,
    key: string,
    defaultTemplate: string,
    values: PaginationTokenValues
): string {
    return localeTextFunc(key, defaultTemplate, Object.values(values));
}

/** As `_getPaginationTemplate`, with the named tokens replaced by their values. */
export function _getPaginationText(
    localeTextFunc: LocaleTextFunc,
    key: string,
    defaultTemplate: string,
    values: PaginationTokenValues
): string {
    // One pass with a function replacer, so a value is never itself substituted or read as a replacement pattern.
    return _getPaginationTemplate(localeTextFunc, key, defaultTemplate, values).replace(
        PAGINATION_TOKEN_REGEX,
        (match, name: string) => values[name.toLowerCase() as PaginationTokenName] ?? match
    );
}

/** Splits text into alternating literal text and token names: even indexes are literals, odd indexes are lower-cased token names. */
export function _splitPaginationTokens(text: string): string[] {
    return text.split(PAGINATION_TOKEN_REGEX).map((part, i) => (i % 2 ? part.toLowerCase() : part));
}

/** The page announcement; `total` is `null` when the last page is not known yet. */
export function _getPageAriaStatus(localeTextFunc: LocaleTextFunc, page: string, total: string | null): string {
    // Defaults are built from the existing words so a localeText without these keys reads as before.
    const pageWord = localeTextFunc('page', 'Page');
    if (total == null) {
        return _getPaginationText(localeTextFunc, 'ariaPaginationPageSummaryUnknownTotal', `${pageWord} \${page}`, {
            page,
        });
    }
    return _getPaginationText(
        localeTextFunc,
        'ariaPaginationPageSummary',
        `${pageWord} \${page} ${localeTextFunc('of', 'of')} \${total}`,
        { page, total }
    );
}

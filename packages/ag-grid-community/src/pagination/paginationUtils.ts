import type { LocaleTextFunc } from 'ag-stack';
import { _translateTokens } from 'ag-stack';

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

/** Splits text into alternating literal text and token names: even indexes are literals, odd indexes are lower-cased token names. */
export function _splitPaginationTokens(text: string): string[] {
    return text.split(PAGINATION_TOKEN_REGEX).map((part, i) => (i % 2 ? part.toLowerCase() : part));
}

/**
 * Fills `container` with the phrase from `_splitPaginationTokens`, putting each element where its token first appears.
 * A repeated token is plain text, and an element whose token is missing is left out. Text nodes are reused, and the
 * element holding focus is never moved: the nodes before it are, so a focused page input keeps focus.
 */
export function _renderPaginationPhrase(
    container: HTMLElement,
    parts: string[],
    elements: Partial<Record<PaginationTokenName, HTMLElement>>,
    values: PaginationTokenValues
): void {
    const unplaced = { ...elements };
    // A detached container's root is an element, which has no active element.
    const activeElement = (container.getRootNode() as Partial<DocumentOrShadowRoot>).activeElement ?? null;
    let current = container.firstChild;
    const insert = (node: Node) => {
        if (current) {
            current.before(node);
        } else {
            container.append(node);
        }
    };
    const removeUntil = (end: Node | null) => {
        while (current && current !== end) {
            const next: ChildNode | null = current.nextSibling;
            current.remove();
            current = next;
        }
    };
    for (let i = 0, len = parts.length; i < len; ++i) {
        const name = parts[i] as PaginationTokenName;
        const element = i % 2 ? unplaced[name] : undefined;
        const text = i % 2 ? (values[name] ?? '') : parts[i];
        if (element) {
            delete unplaced[name];
        }
        if (element && element === current) {
            current = current.nextSibling;
        } else if (element?.parentNode === container && element.contains(activeElement)) {
            removeUntil(element);
            current = element.nextSibling;
        } else if (element) {
            insert(element);
        } else if (text !== '' && current?.nodeType === Node.TEXT_NODE) {
            current.textContent = text;
            current = current.nextSibling;
        } else if (text !== '') {
            insert(container.ownerDocument.createTextNode(text));
        }
    }
    removeUntil(null);
}

/** The page announcement; `total` is `null` when the last page is not known yet. */
export function _getPageAriaStatus(localeTextFunc: LocaleTextFunc, page: string, total: string | null): string {
    // Defaults are built from the existing words so a localeText without these keys reads as before.
    const pageWord = localeTextFunc('page', 'Page');
    if (total == null) {
        return _translateTokens(localeTextFunc, 'ariaPaginationPageSummaryUnknownTotal', `${pageWord} \${page}`, {
            page,
        });
    }
    return _translateTokens(
        localeTextFunc,
        'ariaPaginationPageSummary',
        `${pageWord} \${page} ${localeTextFunc('of', 'of')} \${total}`,
        { page, total }
    );
}

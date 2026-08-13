import type { LocaleTextFunc } from 'ag-stack';
import { _hasOwn, _translate } from 'ag-stack';

const FILTER_LOCALE_TEXT = {
    applyFilter: 'Apply',
    clearFilter: 'Clear',
    resetFilter: 'Reset',
    cancelFilter: 'Cancel',
    textFilter: 'Text Filter',
    numberFilter: 'Number Filter',
    bigintFilter: 'BigInt Filter',
    dateFilter: 'Date Filter',
    setFilter: 'Set Filter',
    filterOoo: 'Filter...',
    empty: 'Choose one',
    equals: 'Equals',
    notEqual: 'Does not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    inRange: 'Between',
    inRangeStart: 'From',
    inRangeEnd: 'To',
    lessThanOrEqual: 'Less than or equal to',
    greaterThanOrEqual: 'Greater than or equal to',
    contains: 'Contains',
    notContains: 'Does not contain',
    startsWith: 'Begins with',
    endsWith: 'Ends with',
    blank: 'Blank',
    notBlank: 'Not blank',
    before: 'Before',
    after: 'After',
    andCondition: 'AND',
    orCondition: 'OR',
    dateFormatOoo: 'yyyy-mm-dd',
    filterSummaryInactive: 'is (All)',
    filterSummaryContains: 'contains',
    filterSummaryNotContains: 'does not contain',
    filterSummaryTextEquals: 'equals',
    filterSummaryTextNotEqual: 'does not equal',
    filterSummaryStartsWith: 'begins with',
    filterSummaryEndsWith: 'ends with',
    filterSummaryBlank: 'is blank',
    filterSummaryNotBlank: 'is not blank',
    filterSummaryEquals: '=',
    filterSummaryNotEqual: '!=',
    filterSummaryGreaterThan: '>',
    filterSummaryGreaterThanOrEqual: '>=',
    filterSummaryLessThan: '<',
    filterSummaryLessThanOrEqual: '<=',
    filterSummaryInRange: 'between',

    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow',
    last7Days: 'Last 7 Days',
    lastWeek: 'Last Week',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    last30Days: 'Last 30 Days',
    lastMonth: 'Last Month',
    thisMonth: 'This Month',
    nextMonth: 'Next Month',
    last90Days: 'Last 90 Days',
    lastQuarter: 'Last Quarter',
    thisQuarter: 'This Quarter',
    nextQuarter: 'Next Quarter',
    lastYear: 'Last Year',
    thisYear: 'This Year',
    yearToDate: 'Year To Date',
    nextYear: 'Next Year',
    last6Months: 'Last 6 Months',
    last12Months: 'Last 12 Months',
    last24Months: 'Last 24 Months',

    filterSummaryInRangeValues: (variableValues: string[]) => `(${variableValues[0]}, ${variableValues[1]})`,
    filterSummaryTextQuote: (variableValues: string[]) => `"${variableValues[0]}"`,
    minDateValidation: (variableValues: string[]) => `Date must be after ${variableValues[0]}`,
    maxDateValidation: (variableValues: string[]) => `Date must be before ${variableValues[0]}`,
    strictMinValueValidation: (variableValues: string[]) => `Must be greater than ${variableValues[0]}`,
    strictMaxValueValidation: (variableValues: string[]) => `Must be less than ${variableValues[0]}`,
};

export type FilterLocaleTextKey = keyof typeof FILTER_LOCALE_TEXT;

/**
 * An option key is a locale key only when the grid itself defines text for it, so an own-property test: `toString`
 * and friends are legal option keys and reach `_translate` as a function, which throws.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function isFilterLocaleTextKey(key: string): key is FilterLocaleTextKey {
    return _hasOwn(FILTER_LOCALE_TEXT, key);
}

/**
 * A filter option key the grid does not define is its own default, so `getLocaleText` is never handed the
 * `undefined` its `defaultValue: string` contract forbids.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function translateFilterOptionKey(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    key: string | null | undefined
): string {
    if (key == null) {
        return ''; // no option, so nothing to localise
    }
    return isFilterLocaleTextKey(key) ? translateForFilter(bean, key) : bean.getLocaleTextFunc()(key, key);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function translateForFilter(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    key: FilterLocaleTextKey,
    variableValues?: string[]
): string {
    return _translate(bean, FILTER_LOCALE_TEXT, key, variableValues);
}

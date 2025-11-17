import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import { _translate } from '../agStack/utils/locale';

const FILTER_LOCALE_TEXT = {
    applyFilter: 'Apply',
    clearFilter: 'Clear',
    resetFilter: 'Reset',
    cancelFilter: 'Cancel',
    textFilter: 'Text Filter',
    numberFilter: 'Number Filter',
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
    filterSummaryInRangeValues: (variableValues: string[]) => `(${variableValues[0]}, ${variableValues[1]})`,
    filterSummaryTextQuote: (variableValues: string[]) => `"${variableValues[0]}"`,
    tooBig: (variableValues: string[]) => getRangeValidityMessage('value', 'no more than', variableValues[0]),
    tooSmall: (variableValues: string[]) => getRangeValidityMessage('value', 'no less than', variableValues[0]),
    tooEarly: (variableValues: string[]) => getRangeValidityMessage('date', 'after', variableValues[0]),
    tooLate: (variableValues: string[]) => getRangeValidityMessage('date', 'before', variableValues[0]),
};

function getRangeValidityMessage(kind: 'value' | 'date', relation: string, value: any): string {
    return `Please select a ${kind} that is ${relation} ${value}`;
}

export type FilterLocaleTextKey = keyof typeof FILTER_LOCALE_TEXT;

export function translateForFilter(
    bean: { getLocaleTextFunc(): LocaleTextFunc },
    key: keyof typeof FILTER_LOCALE_TEXT,
    variableValues?: string[]
): string {
    return _translate(bean, FILTER_LOCALE_TEXT, key, variableValues);
}

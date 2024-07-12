import type { NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

const DEFAULT_TRANSLATIONS = {
    filters: 'Filters',
    addFilter: 'Add Filter',
    filterSummaryInactive: 'is (All)',
    filterSearch: 'Search',
    equals: 'Equals',
    notEqual: 'Does not equal',
    blank: 'Blank',
    notBlank: 'Not blank',
    empty: 'Choose one',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    lessThanOrEqual: 'Less than or equal to',
    greaterThanOrEqual: 'Greater than or equal to',
    inRange: 'Between',
    inRangeStart: 'From',
    inRangeEnd: 'To',
    contains: 'Contains',
    notContains: 'Does not contain',
    startsWith: 'Begins with',
    endsWith: 'Ends with',
    ariaFilteringOperator: 'Filtering operator',
    andCondition: 'AND',
    orCondition: 'OR',
} as const;

export type FilterPanelTranslationKey = keyof typeof DEFAULT_TRANSLATIONS;

export class FilterPanelTranslationService extends BeanStub implements NamedBean {
    beanName = 'filterPanelTranslationService' as const;

    public translate(key: FilterPanelTranslationKey): string {
        const translate = this.localeService.getLocaleTextFunc();
        const defaultTranslation = DEFAULT_TRANSLATIONS[key];
        return translate(key, defaultTranslation);
    }
}

export const DEFAULT_LOCALE_TEXT = {
    loadingOoo: 'Loading...',
    blanks: '(Blanks)',
    searchOoo: 'Search...',
    selectAll: '(Select All)',
    selectAllSearchResults: '(Select All Search Results)',
    addCurrentSelectionToFilter: 'Add current selection to filter',
    noMatches: 'No matches.',
    ariaSearchFilterValues: 'Search filter values',
    ariaFilterList: 'Filter List',
    filterSummaryListInactive: 'is (All)',
    filterSummaryListSeparator: ', ',
    filterSummaryListShort: (variableValues: string[]) => `is (${variableValues[0]})`,
    filterSummaryListLong: (variableValues: string[]) => `is (${variableValues[0]}) and ${variableValues[1]} more`,
} as const;

export type SetFilterLocaleTextKey = keyof typeof DEFAULT_LOCALE_TEXT;

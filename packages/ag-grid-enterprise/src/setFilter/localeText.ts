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
} as const;

export type ISetFilterLocaleText = typeof DEFAULT_LOCALE_TEXT;

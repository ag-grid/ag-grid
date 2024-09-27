export interface ISetFilterLocaleText {
    loadingOoo: string;
    blanks: string;
    searchOoo: string;
    selectAll: string;
    selectAllSearchResults: string;
    addCurrentSelectionToFilter: string;
    noMatches: string;
}

export const DEFAULT_LOCALE_TEXT: ISetFilterLocaleText = {
    loadingOoo: 'Loading...',
    blanks: '(Blanks)',
    searchOoo: 'Search...',
    selectAll: '(Select All)',
    selectAllSearchResults: '(Select All Search Results)',
    addCurrentSelectionToFilter: 'Add current selection to filter',
    noMatches: 'No matches.',
};

export interface IFilterLocaleText {
    applyFilter: string;
    clearFilter: string;
    resetFilter: string;
    cancelFilter: string;
    filterOoo: string;
    empty: string;
    equals: string;
    notEqual: string;
    lessThan: string;
    greaterThan: string;
    inRange: string;
    inRangeStart: string;
    inRangeEnd: string;
    lessThanOrEqual: string;
    greaterThanOrEqual: string;
    contains: string;
    notContains: string;
    startsWith: string;
    endsWith: string;
    blank: string;
    notBlank: string;
    andCondition: string;
    orCondition: string;
    dateFormatOoo: string;
}

export interface IFilterTitleLocaleText {
    textFilter: string;
    numberFilter: string;
    dateFilter: string;
    setFilter: string;
}

export const DEFAULT_FILTER_LOCALE_TEXT: IFilterLocaleText & IFilterTitleLocaleText = {
    applyFilter: 'Apply',
    clearFilter: 'Clear',
    resetFilter: 'Reset',
    cancelFilter: 'Cancel',
    textFilter: 'Text Filter',
    numberFilter: 'Number Filter',
    dateFilter: 'Date Filter',
    setFilter: 'Set Filter',
    filterOoo: 'Filter...',
    empty: 'Choose One',
    equals: 'Equals',
    notEqual: 'Not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    inRange: 'In range',
    inRangeStart: 'From',
    inRangeEnd: 'To',
    lessThanOrEqual: 'Less than or equals',
    greaterThanOrEqual: 'Greater than or equals',
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    blank: 'Blank',
    notBlank: 'Not blank',
    andCondition: 'AND',
    orCondition: 'OR',
    dateFormatOoo: 'yyyy-mm-dd',
};
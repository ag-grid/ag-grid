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
    andCondition: string;
    orCondition: string;
    dateFormatOoo: string;
}

export interface IFilterNameLocaleText {
    textFilter: string;
    numberFilter: string;
    dateFilter: string;
    setFilter: string;
}

export const DEFAULT_FILTER_LOCALE_TEXT: IFilterLocaleText & IFilterNameLocaleText = {
    applyFilter: 'Apply Filter',
    clearFilter: 'Clear Filter',
    resetFilter: 'Reset Filter',
    cancelFilter: 'Cancel Filter',
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
    andCondition: 'AND',
    orCondition: 'OR',
    dateFormatOoo: 'yyyy-mm-dd',
};
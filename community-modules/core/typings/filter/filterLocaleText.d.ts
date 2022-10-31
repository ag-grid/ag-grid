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
export declare const DEFAULT_FILTER_LOCALE_TEXT: IFilterLocaleText & IFilterTitleLocaleText;

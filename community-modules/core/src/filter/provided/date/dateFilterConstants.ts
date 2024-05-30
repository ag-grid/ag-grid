import { SimpleFilterOptions } from '../simpleFilterOptions';

export const DEFAULT_DATE_FILTER_OPTIONS: string[] = [
    SimpleFilterOptions.EQUALS,
    SimpleFilterOptions.NOT_EQUAL,
    SimpleFilterOptions.LESS_THAN,
    SimpleFilterOptions.GREATER_THAN,
    SimpleFilterOptions.IN_RANGE,
    SimpleFilterOptions.BLANK,
    SimpleFilterOptions.NOT_BLANK,
];

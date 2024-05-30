import { SimpleFilterOptions } from '../simpleFilterOptions';

export const DEFAULT_NUMBER_FILTER_OPTIONS: string[] = [
    SimpleFilterOptions.EQUALS,
    SimpleFilterOptions.NOT_EQUAL,
    SimpleFilterOptions.GREATER_THAN,
    SimpleFilterOptions.GREATER_THAN_OR_EQUAL,
    SimpleFilterOptions.LESS_THAN,
    SimpleFilterOptions.LESS_THAN_OR_EQUAL,
    SimpleFilterOptions.IN_RANGE,
    SimpleFilterOptions.BLANK,
    SimpleFilterOptions.NOT_BLANK,
];

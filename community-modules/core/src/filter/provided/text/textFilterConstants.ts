import { SimpleFilterOptions } from '../simpleFilterOptions';

export const DEFAULT_TEXT_FILTER_OPTIONS: string[] = [
    SimpleFilterOptions.CONTAINS,
    SimpleFilterOptions.NOT_CONTAINS,
    SimpleFilterOptions.EQUALS,
    SimpleFilterOptions.NOT_EQUAL,
    SimpleFilterOptions.STARTS_WITH,
    SimpleFilterOptions.ENDS_WITH,
    SimpleFilterOptions.BLANK,
    SimpleFilterOptions.NOT_BLANK,
];

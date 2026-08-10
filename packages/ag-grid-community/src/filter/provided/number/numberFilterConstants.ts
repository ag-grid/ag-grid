import { defineFilterOptions } from '../simpleFilterUtils';

export const NUMBER_FILTER_OPTIONS = defineFilterOptions([
    'equals',
    'notEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'inRange',
    'blank',
    'notBlank',
]);

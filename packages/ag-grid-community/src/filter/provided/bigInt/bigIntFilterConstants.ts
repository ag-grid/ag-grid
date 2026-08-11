import { defineFilterOptions } from '../simpleFilterUtils';

export const BIGINT_FILTER_OPTIONS = defineFilterOptions([
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

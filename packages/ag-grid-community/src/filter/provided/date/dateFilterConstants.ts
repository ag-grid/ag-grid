import { defineFilterOptions, zeroInputTypes } from '../simpleFilterUtils';

export const DATE_FILTER_OPTIONS = defineFilterOptions(
    ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange', 'blank', 'notBlank'],
    ['lessThanOrEqual', 'greaterThanOrEqual', ...zeroInputTypes]
);

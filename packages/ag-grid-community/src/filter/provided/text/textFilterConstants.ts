import { defineFilterOptions } from '../simpleFilterUtils';

export const TEXT_FILTER_OPTIONS = defineFilterOptions([
    'contains',
    'notContains',
    'equals',
    'notEqual',
    'startsWith',
    'endsWith',
    'blank',
    'notBlank',
]);

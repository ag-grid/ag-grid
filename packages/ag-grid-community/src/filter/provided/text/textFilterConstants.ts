import type { ISimpleFilterModelType } from '../iSimpleFilter';

export const DEFAULT_TEXT_FILTER_OPTIONS: ISimpleFilterModelType[] = [
    'contains',
    'notContains',
    'equals',
    'notEqual',
    'startsWith',
    'endsWith',
    'blank',
    'notBlank',
];

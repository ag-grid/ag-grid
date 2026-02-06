import type { ISimpleFilterModelType } from '../iSimpleFilter';

export const DEFAULT_BIGINT_FILTER_OPTIONS: ISimpleFilterModelType[] = [
    'equals',
    'notEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'inRange',
    'blank',
    'notBlank',
];

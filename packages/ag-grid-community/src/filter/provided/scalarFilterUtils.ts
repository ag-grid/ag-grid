import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { ISimpleFilterModelType } from './iSimpleFilter';

export function getScalarFilterTypeKey(type: ISimpleFilterModelType | null | undefined): FilterLocaleTextKey | null {
    const addPrefix = <T extends string>(suffix: T) => `filterSummary${suffix}` as const;
    switch (type) {
        case 'equals':
            return addPrefix('Equals');
        case 'notEqual':
            return addPrefix('NotEqual');
        case 'greaterThan':
            return addPrefix('GreaterThan');
        case 'greaterThanOrEqual':
            return addPrefix('GreaterThanOrEqual');
        case 'lessThan':
            return addPrefix('LessThan');
        case 'lessThanOrEqual':
            return addPrefix('LessThanOrEqual');
        case 'inRange':
            return addPrefix('InRange');
    }
    return null;
}

import { _isInheritedReservedKey } from './generic';

/**
 * Reads a deep property from `data` using a dotted path. Callers must have already verified
 * that the field contains dots — for plain field names use `_getValueUsingPlainField`. Reserved keys are only
 * followed where the object holds them as its own data (see `_isInheritedReservedKey`).
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getValueUsingDotField(data: any, field: string): any {
    const fields = field.split('.');
    let currentObject = data;
    for (let i = 0; i < fields.length; i++) {
        const key = fields[i];
        if (currentObject == null || _isInheritedReservedKey(currentObject, key)) {
            return undefined;
        }
        currentObject = currentObject[key];
    }
    return currentObject;
}

/**
 * Reads a property from `data` using a field name without dots, following the same reserved-key rule as
 * `_getValueUsingDotField`.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getValueUsingPlainField(data: any, field: string): any {
    return _isInheritedReservedKey(data, field) ? undefined : data[field];
}

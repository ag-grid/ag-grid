import { _isInheritedReservedKey } from './generic';

/**
 * Reads a deep property from `data` using a dotted path. Callers must have already verified
 * that the field contains dots — for plain field names use `data[field]` directly. Reserved keys are only
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

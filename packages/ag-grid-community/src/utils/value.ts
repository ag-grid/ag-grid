/**
 * Reads a deep property from `data` following a pre-split dotted path. Hot-path variant of
 * `_getValueUsingDotField` (ag-stack): callers reading the same field per cell cache `field.split('.')` once
 * (on colDef update) and use this, avoiding a split + array allocation per read.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getValueUsingDotPath(data: any, fields: string[]): any {
    let currentObject = data;
    for (let i = 0, len = fields.length; i < len; i++) {
        if (currentObject == null) {
            return undefined;
        }
        currentObject = currentObject[fields[i]];
    }
    return currentObject;
}

/**
 * True when `field` reaches `__proto__`: as any segment of its pre-split `fieldPath`, or as the whole field when it
 * has no path. Such fields are neither read nor written.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _isProtoField(field: string, fieldPath: string[] | null): boolean {
    return fieldPath ? fieldPath.includes('__proto__') : field === '__proto__';
}

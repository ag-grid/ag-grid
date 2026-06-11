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

/** Reads a value from a nested object using a dot-notation field path (e.g. 'address.city').
 *  Only call this when the field contains dots — for simple fields, use `data[field]` directly. */
export function _getValueUsingDotNotation(data: any, field: string): any {
    const fields = field.split('.');
    let currentObject = data;

    for (let i = 0; i < fields.length; i++) {
        if (currentObject == null) {
            return undefined;
        }
        currentObject = currentObject[fields[i]];
    }

    return currentObject;
}

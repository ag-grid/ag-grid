export function _getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any {
    if (!field || !data) {
        return;
    }

    // if no '.', then it's not a deep value
    if (!fieldContainsDots) {
        return data[field];
    }

    // otherwise it is a deep value, so need to dig for it
    const fields = field.split('.');
    let currentObject = data;

    for (const part of fields) {
        if (currentObject == null) {
            return undefined;
        }
        currentObject = currentObject[part];
    }

    return currentObject;
}

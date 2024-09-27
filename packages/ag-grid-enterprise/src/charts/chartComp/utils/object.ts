export function get(source: any, expression: string, defaultValue: any): any {
    if (source == null) {
        return defaultValue;
    }

    const keys = expression.split('.');
    let objectToRead = source;

    while (keys.length > 1) {
        objectToRead = objectToRead[keys.shift()!];

        if (objectToRead == null) {
            return defaultValue;
        }
    }

    const value = objectToRead[keys[0]];

    return value != null ? value : defaultValue;
}

export function set(target: any, expression: string, value: any) {
    if (target == null) {
        return;
    }

    const keys = expression.split('.');

    let objectToUpdate = target;
    // Create empty objects
    keys.forEach((key, i) => {
        if (!objectToUpdate[key]) {
            objectToUpdate[key] = {};
        }

        if (i < keys.length - 1) {
            objectToUpdate = objectToUpdate[key];
        }
    });

    objectToUpdate[keys[keys.length - 1]] = value;
}

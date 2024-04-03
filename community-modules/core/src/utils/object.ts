import { exists } from './generic';

export function iterateObject<T>(object: { [p: string]: T; } | T[] | null | undefined, callback: (key: string, value: T) => void) {
    if (object == null) { return; }

    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            callback(i.toString(), object[i]);
        }
        return;
    }

    for (const [key, value ] of Object.entries(object)) {
        callback(key, value);
    }
}

export function cloneObject<T extends {}>(object: T): T {
    const copy = {} as T;
    const keys = Object.keys(object);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = (object as any)[key];
        (copy as any)[key] = value;
    }

    return copy;
}

// returns copy of an object, doing a deep clone of any objects with that object.
// this is used for eg creating copies of Column Definitions, where we want to
// deep copy all objects, but do not want to deep copy functions (eg when user provides
// a function or class for colDef.cellRenderer)
export function deepCloneDefinition<T>(object: T, keysToSkip?: string[]): T | undefined {
    if (!object) { return; }

    const obj = object as any;
    const res: any = {};

    Object.keys(obj).forEach(key => {

        if (keysToSkip && keysToSkip.indexOf(key) >= 0) { return; }

        const value = obj[key];

        // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}. it does
        // NOT include the following:
        // 1) arrays
        // 2) functions or classes (eg ColumnAPI instance)
        const sourceIsSimpleObject = isNonNullObject(value) && value.constructor === Object;

        if (sourceIsSimpleObject) {
            res[key] = deepCloneDefinition(value);
        } else {
            res[key] = value;
        }
    });

    return res;
}

export function getAllValuesInObject<T extends Object, K extends keyof T, O extends T[K]>(obj: T): O[] {
    if (!obj) { return []; }
    const anyObject = Object as any;
    if (typeof anyObject.values === 'function') {
        return anyObject.values(obj);
    }

    const ret: any[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
            ret.push(obj[key]);
        }
    }

    return ret;
}

export function mergeDeep(dest: any, source: any, copyUndefined = true, makeCopyOfSimpleObjects = false): void {
    if (!exists(source)) { return; }

    iterateObject(source, (key: string, sourceValue: any) => {
        let destValue: any = dest[key];

        if (destValue === sourceValue) { return; }

        // when creating params, we don't want to just copy objects over. otherwise merging ColDefs (eg DefaultColDef
        // and Column Types) would result in params getting shared between objects.
        // by putting an empty value into destValue first, it means we end up copying over values from
        // the source object, rather than just copying in the source object in it's entirety.
        if (makeCopyOfSimpleObjects) {
            const objectIsDueToBeCopied = destValue == null && sourceValue != null;

            if (objectIsDueToBeCopied) {
                // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}, as opposed
                // to a Class instance (such as ColumnAPI instance).
                const sourceIsSimpleObject = typeof sourceValue === 'object' && sourceValue.constructor === Object;
                const dontCopy = sourceIsSimpleObject;

                if (dontCopy) {
                    destValue = {};
                    dest[key] = destValue;
                }
            }
        }

        if (isNonNullObject(sourceValue) && isNonNullObject(destValue) && !Array.isArray(destValue)) {
            mergeDeep(destValue, sourceValue, copyUndefined, makeCopyOfSimpleObjects);
        } else if (copyUndefined || sourceValue !== undefined) {
            dest[key] = sourceValue;
        }
    });
}

export function getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any {
    if (!field || !data) { return; }

    // if no '.', then it's not a deep value
    if (!fieldContainsDots) {
        return data[field];
    }

    // otherwise it is a deep value, so need to dig for it
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

// used by GridAPI to remove all references, so keeping grid in memory resulting in a
// memory leak if user is not disposing of the GridAPI references
export function removeAllReferences<T>(obj: any, preserveKeys: (keyof T)[] = [], preDestroyLink: string): void {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        // we want to replace all the @autowired services, which are objects. any simple types (boolean, string etc)
        // we don't care about
        if (typeof value === 'object' && !preserveKeys.includes(key as any)) {
            obj[key] = undefined;
        }
    });
    const proto = Object.getPrototypeOf(obj);
    const properties: any = {};

    const msgFunc = (key: string) =>  
    `AG Grid: Grid API function ${key}() cannot be called as the grid has been destroyed.
    It is recommended to remove local references to the grid api. Alternatively, check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.
    To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${preDestroyLink}`;

    Object.getOwnPropertyNames(proto).forEach(key => {
        const value = proto[key];
        // leave all basic types and preserveKeys this is needed for GridAPI to leave the "destroyed: boolean" attribute and isDestroyed() function.
        if (typeof value === 'function' && !preserveKeys.includes(key as any)) {
            const func = () => {
                console.warn(msgFunc(key));
            };
            properties[key] = { value: func, writable: true };
        }
    });

    Object.defineProperties(obj, properties);
}

export function isNonNullObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
}

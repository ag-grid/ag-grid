const ID_MAP: Record<string, number> = {};

export function resetIds() {
    for (const key in ID_MAP) {
        delete ID_MAP[key];
    }
}

export function createId(instance: any): string {
    const constructor = instance.constructor;
    const className = constructor.hasOwnProperty('className') ? constructor.className : constructor.name;

    if (!className) {
        throw new Error(`The ${constructor} is missing the 'className' property.`);
    }
    const nextId = (ID_MAP[className] ?? 0) + 1;
    ID_MAP[className] = nextId;

    return className + '-' + nextId;
}

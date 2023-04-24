const ID_MAP = {};
export function resetIds() {
    for (const key in ID_MAP) {
        delete ID_MAP[key];
    }
}
export function createId(instance) {
    var _a;
    const constructor = instance.constructor;
    const className = Object.prototype.hasOwnProperty.call(constructor, 'className')
        ? constructor.className
        : constructor.name;
    if (!className) {
        throw new Error(`The ${constructor} is missing the 'className' property.`);
    }
    const nextId = ((_a = ID_MAP[className]) !== null && _a !== void 0 ? _a : 0) + 1;
    ID_MAP[className] = nextId;
    return className + '-' + nextId;
}

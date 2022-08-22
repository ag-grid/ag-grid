var ID_MAP = {};
export function resetIds() {
    for (var key in ID_MAP) {
        delete ID_MAP[key];
    }
}
export function createId(instance) {
    var _a;
    var constructor = instance.constructor;
    var className = constructor.hasOwnProperty('className') ? constructor.className : constructor.name;
    if (!className) {
        throw new Error("The " + constructor + " is missing the 'className' property.");
    }
    var nextId = (_a = ID_MAP[className], (_a !== null && _a !== void 0 ? _a : 0)) + 1;
    ID_MAP[className] = nextId;
    return className + '-' + nextId;
}

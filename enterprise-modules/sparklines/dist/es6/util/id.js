export function createId(instance) {
    var constructor = instance.constructor;
    var className = constructor.className;
    if (!className) {
        throw new Error("The " + constructor + " is missing the 'className' property.");
    }
    return className + '-' + (constructor.id = (constructor.id || 0) + 1);
}

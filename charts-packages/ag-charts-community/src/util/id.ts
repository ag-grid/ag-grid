export function createId(instance: any): string {
    const constructor = instance.constructor;
    const className = constructor.hasOwnProperty('className') ? constructor.className : constructor.name;

    if (!className) {
        throw new Error(`The ${constructor} is missing the 'className' property.`);
    }

    return className + '-' + (constructor.id = (constructor.id || 0) + 1);
}

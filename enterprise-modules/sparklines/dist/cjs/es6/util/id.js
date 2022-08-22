"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createId(instance) {
    const constructor = instance.constructor;
    const className = constructor.className;
    if (!className) {
        throw new Error(`The ${constructor} is missing the 'className' property.`);
    }
    return className + '-' + (constructor.id = (constructor.id || 0) + 1);
}
exports.createId = createId;

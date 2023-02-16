"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createId = exports.resetIds = void 0;
const ID_MAP = {};
function resetIds() {
    for (const key in ID_MAP) {
        delete ID_MAP[key];
    }
}
exports.resetIds = resetIds;
function createId(instance) {
    var _a;
    const constructor = instance.constructor;
    const className = constructor.hasOwnProperty('className') ? constructor.className : constructor.name;
    if (!className) {
        throw new Error(`The ${constructor} is missing the 'className' property.`);
    }
    const nextId = ((_a = ID_MAP[className]) !== null && _a !== void 0 ? _a : 0) + 1;
    ID_MAP[className] = nextId;
    return className + '-' + nextId;
}
exports.createId = createId;

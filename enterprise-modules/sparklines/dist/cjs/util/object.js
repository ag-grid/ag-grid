"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
function chainObjects(parent, child) {
    var obj = Object.create(parent);
    for (var prop in child) {
        if (child.hasOwnProperty(prop)) {
            obj[prop] = child[prop];
        }
    }
    return obj;
}
exports.chainObjects = chainObjects;
//# sourceMappingURL=object.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const decorator_1 = require("./decorator");
function Default(defaultValue, replaces = [undefined]) {
    return decorator_1.addTransformToInstanceProperty((_, __, v) => {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}
exports.Default = Default;

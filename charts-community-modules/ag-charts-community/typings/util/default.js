"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var decorator_1 = require("./decorator");
function Default(defaultValue, replaces) {
    if (replaces === void 0) { replaces = [undefined]; }
    return decorator_1.addTransformToInstanceProperty(function (_, __, v) {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}
exports.Default = Default;
//# sourceMappingURL=default.js.map
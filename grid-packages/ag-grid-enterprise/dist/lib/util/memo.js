"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memo = void 0;
var memorizedFns = new Map();
function memo(params, fnGenerator) {
    var _a, _b, _c;
    var serialisedParams = JSON.stringify(params, null, 0);
    if (!memorizedFns.has(fnGenerator)) {
        memorizedFns.set(fnGenerator, new Map());
    }
    if (!((_a = memorizedFns.get(fnGenerator)) === null || _a === void 0 ? void 0 : _a.has(serialisedParams))) {
        (_b = memorizedFns.get(fnGenerator)) === null || _b === void 0 ? void 0 : _b.set(serialisedParams, fnGenerator(params));
    }
    return (_c = memorizedFns.get(fnGenerator)) === null || _c === void 0 ? void 0 : _c.get(serialisedParams);
}
exports.memo = memo;
//# sourceMappingURL=memo.js.map
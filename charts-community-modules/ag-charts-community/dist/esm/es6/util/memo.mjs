const memorizedFns = new Map();
export function memo(params, fnGenerator) {
    var _a, _b, _c;
    const serialisedParams = JSON.stringify(params, null, 0);
    if (!memorizedFns.has(fnGenerator)) {
        memorizedFns.set(fnGenerator, new Map());
    }
    if (!((_a = memorizedFns.get(fnGenerator)) === null || _a === void 0 ? void 0 : _a.has(serialisedParams))) {
        (_b = memorizedFns.get(fnGenerator)) === null || _b === void 0 ? void 0 : _b.set(serialisedParams, fnGenerator(params));
    }
    return (_c = memorizedFns.get(fnGenerator)) === null || _c === void 0 ? void 0 : _c.get(serialisedParams);
}

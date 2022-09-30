// @ag-grid-community/react v28.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChangeDetectionStrategyType;
(function (ChangeDetectionStrategyType) {
    ChangeDetectionStrategyType["IdentityCheck"] = "IdentityCheck";
    ChangeDetectionStrategyType["DeepValueCheck"] = "DeepValueCheck";
    ChangeDetectionStrategyType["NoCheck"] = "NoCheck";
})(ChangeDetectionStrategyType = exports.ChangeDetectionStrategyType || (exports.ChangeDetectionStrategyType = {}));
class SimpleFunctionalStrategy {
    constructor(strategy) {
        this.strategy = strategy;
    }
    areEqual(a, b) {
        return this.strategy(a, b);
    }
}
class DeepValueStrategy {
    areEqual(a, b) {
        return DeepValueStrategy.areEquivalent(DeepValueStrategy.copy(a), DeepValueStrategy.copy(b));
    }
    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    static unwrapStringOrNumber(obj) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    }
    // sigh, here for ie compatibility
    static copy(value) {
        if (!value) {
            return value;
        }
        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            const arrayCopy = [];
            for (let i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }
        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them
        if (typeof value !== "object") {
            return value;
        }
        return [{}, value].reduce((r, o) => {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }
    static isNaN(value) {
        if (Number.isNaN) {
            return Number.isNaN(value);
        }
        // for ie11...
        return typeof (value) === 'number' && isNaN(value);
    }
    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    static areEquivalent(a, b) {
        a = DeepValueStrategy.unwrapStringOrNumber(a);
        b = DeepValueStrategy.unwrapStringOrNumber(b);
        if (a === b)
            return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b)
            return false;
        if (DeepValueStrategy.isNaN(a) && DeepValueStrategy.isNaN(b)) {
            return true;
        }
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            // false to allow for callbacks to be reactive...
            return false;
        }
        if (typeof a !== "object" ||
            (a.$$typeof && a.$$typeof.toString() === "Symbol(react.element)")) {
            return a == b; //for boolean, number, string, function, xml
        }
        if (Object.isFrozen(a) || Object.isFrozen(b)) {
            return a === b;
        }
        const newA = a.areEquivPropertyTracking === undefined, newB = b.areEquivPropertyTracking === undefined;
        try {
            let prop;
            if (newA) {
                a.areEquivPropertyTracking = [];
            }
            else if (a.areEquivPropertyTracking.some(function (other) {
                return other === b;
            }))
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            }
            else if (b.areEquivPropertyTracking.some((other) => other === a)) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);
            const tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    tmp[prop] = null;
                }
            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        }
        finally {
            if (newA)
                delete a.areEquivPropertyTracking;
            if (newB)
                delete b.areEquivPropertyTracking;
        }
    }
}
class ChangeDetectionService {
    constructor() {
        this.strategyMap = {
            [ChangeDetectionStrategyType.DeepValueCheck]: new DeepValueStrategy(),
            [ChangeDetectionStrategyType.IdentityCheck]: new SimpleFunctionalStrategy((a, b) => a === b),
            [ChangeDetectionStrategyType.NoCheck]: new SimpleFunctionalStrategy((a, b) => false)
        };
    }
    getStrategy(changeDetectionStrategy) {
        return this.strategyMap[changeDetectionStrategy];
    }
}
exports.ChangeDetectionService = ChangeDetectionService;

//# sourceMappingURL=changeDetectionService.js.map

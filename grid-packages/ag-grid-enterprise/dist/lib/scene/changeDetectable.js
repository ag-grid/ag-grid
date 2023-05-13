"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeDetectable = exports.SceneChangeDetection = exports.RedrawType = void 0;
var window_1 = require("../util/window");
var RedrawType;
(function (RedrawType) {
    RedrawType[RedrawType["NONE"] = 0] = "NONE";
    // Canvas doesn't need clearing, an incremental re-rerender is sufficient.
    RedrawType[RedrawType["TRIVIAL"] = 1] = "TRIVIAL";
    // Group needs clearing, a semi-incremental re-render is sufficient.
    RedrawType[RedrawType["MINOR"] = 2] = "MINOR";
    // Canvas needs to be cleared for these redraw types.
    RedrawType[RedrawType["MAJOR"] = 3] = "MAJOR";
})(RedrawType = exports.RedrawType || (exports.RedrawType = {}));
/** @returns true if eval() is disabled in the current execution context. */
function evalAvailable() {
    try {
        eval('');
        return true;
    }
    catch (e) {
        return false;
    }
}
var EVAL_USEABLE = evalAvailable();
function SceneChangeDetection(opts) {
    var _a = opts || {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.TRIVIAL : _b, _c = _a.type, type = _c === void 0 ? 'normal' : _c, changeCb = _a.changeCb, convertor = _a.convertor, _d = _a.checkDirtyOnAssignment, checkDirtyOnAssignment = _d === void 0 ? false : _d;
    var debug = window_1.windowValue('agChartsSceneChangeDetectionDebug') != null;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        if (target[key]) {
            return;
        }
        if (EVAL_USEABLE) {
            // Optimised code-path.
            // Remove all conditional logic from runtime - generate a setter with the exact necessary
            // steps, as these setters are called a LOT during update cycles.
            var setterJs = "\n                " + (debug ? 'var setCount = 0;' : '') + "\n                function set_" + key + "(value) {\n                    const oldValue = this." + privateKey + ";\n                    " + (convertor ? 'value = convertor(value);' : '') + "\n                    if (value !== oldValue) {\n                        this." + privateKey + " = value;\n                        " + (debug
                ? "console.log({ t: this, property: '" + key + "', oldValue, value, stack: new Error().stack });"
                : '') + "\n                        " + (type === 'normal' ? "this.markDirty(this, " + redraw + ");" : '') + "\n                        " + (type === 'transform' ? "this.markDirtyTransform(" + redraw + ");" : '') + "\n                        " + (type === 'path'
                ? "if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, " + redraw + "); }"
                : '') + "\n                        " + (type === 'font'
                ? "if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, " + redraw + "); }"
                : '') + "\n                        " + (changeCb ? 'changeCb(this);' : '') + "\n                    }\n                    " + (checkDirtyOnAssignment
                ? "if (value != null && value._dirty > " + RedrawType.NONE + ") { this.markDirty(value, value._dirty); }"
                : '') + "\n                };\n                set_" + key + ";\n            ";
            var getterJs = "\n                function get_" + key + "() {\n                    return this." + privateKey + ";\n                };\n                get_" + key + ";\n            ";
            Object.defineProperty(target, key, {
                set: eval(setterJs),
                get: eval(getterJs),
                enumerable: true,
                configurable: true,
            });
        }
        else {
            // Unoptimised but 'safe' code-path, for environments with CSP headers and no 'unsafe-eval'.
            // We deliberately do not support debug branches found in the optimised path above, since
            // for large data-set series performance deteriorates with every extra branch here.
            var setter = function (value) {
                var oldValue = this[privateKey];
                value = convertor ? convertor(value) : value;
                if (value !== oldValue) {
                    this[privateKey] = value;
                    if (type === 'normal')
                        this.markDirty(this, redraw);
                    if (type === 'transform')
                        this.markDirtyTransform(redraw);
                    if (type === 'path' && !this._dirtyPath) {
                        this._dirtyPath = true;
                        this.markDirty(this, redraw);
                    }
                    if (type === 'font' && !this._dirtyFont) {
                        this._dirtyFont = true;
                        this.markDirty(this, redraw);
                    }
                    if (changeCb)
                        changeCb(this);
                }
                if (checkDirtyOnAssignment && value != null && value._dirty > RedrawType.NONE)
                    this.markDirty(value, value._dirty);
            };
            var getter = function () {
                return this[privateKey];
            };
            Object.defineProperty(target, key, {
                set: setter,
                get: getter,
                enumerable: true,
                configurable: true,
            });
        }
    };
}
exports.SceneChangeDetection = SceneChangeDetection;
var ChangeDetectable = /** @class */ (function () {
    function ChangeDetectable() {
        this._dirty = RedrawType.MAJOR;
    }
    ChangeDetectable.prototype.markDirty = function (_source, type) {
        if (type === void 0) { type = RedrawType.TRIVIAL; }
        if (this._dirty > type) {
            return;
        }
        this._dirty = type;
    };
    ChangeDetectable.prototype.markClean = function (_opts) {
        this._dirty = RedrawType.NONE;
    };
    ChangeDetectable.prototype.isDirty = function () {
        return this._dirty > RedrawType.NONE;
    };
    return ChangeDetectable;
}());
exports.ChangeDetectable = ChangeDetectable;
//# sourceMappingURL=changeDetectable.js.map
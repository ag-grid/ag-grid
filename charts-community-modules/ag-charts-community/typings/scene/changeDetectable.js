"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeDetectable = exports.SceneChangeDetection = exports.RedrawType = void 0;
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
/** @returns true if new Function() is disabled in the current execution context. */
function functionConstructorAvailable() {
    try {
        new Function('return true');
        return true;
    }
    catch (e) {
        return false;
    }
}
var STRING_FUNCTION_USEABLE = functionConstructorAvailable();
function SceneChangeDetection(opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, changeCb = _a.changeCb, convertor = _a.convertor;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        if (target[key]) {
            return;
        }
        if (STRING_FUNCTION_USEABLE && changeCb == null && convertor == null) {
            prepareFastGetSet(target, key, privateKey, opts);
        }
        else {
            prepareSlowGetSet(target, key, privateKey, opts);
        }
    };
}
exports.SceneChangeDetection = SceneChangeDetection;
function prepareFastGetSet(target, key, privateKey, opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.TRIVIAL : _b, _c = _a.type, type = _c === void 0 ? 'normal' : _c, _d = _a.checkDirtyOnAssignment, checkDirtyOnAssignment = _d === void 0 ? false : _d;
    // Optimised code-path.
    // Remove all conditional logic from runtime - generate a setter with the exact necessary
    // steps, as these setters are called a LOT during update cycles.
    var setterJs = new Function('value', "\n        const oldValue = this." + privateKey + ";\n        if (value !== oldValue) {\n            this." + privateKey + " = value;\n            " + (type === 'normal' ? "this.markDirty(this, " + redraw + ");" : '') + "\n            " + (type === 'transform' ? "this.markDirtyTransform(" + redraw + ");" : '') + "\n            " + (type === 'path'
        ? "if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, " + redraw + "); }"
        : '') + "\n            " + (type === 'font'
        ? "if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, " + redraw + "); }"
        : '') + "\n        }\n        " + (checkDirtyOnAssignment
        ? "if (value != null && value._dirty > " + RedrawType.NONE + ") { this.markDirty(value, value._dirty); }"
        : '') + "\n");
    var getterJs = new Function("return this." + privateKey + ";");
    Object.defineProperty(target, key, {
        set: setterJs,
        get: getterJs,
        enumerable: true,
        configurable: true,
    });
}
function prepareSlowGetSet(target, key, privateKey, opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.TRIVIAL : _b, _c = _a.type, type = _c === void 0 ? 'normal' : _c, changeCb = _a.changeCb, convertor = _a.convertor, _d = _a.checkDirtyOnAssignment, checkDirtyOnAssignment = _d === void 0 ? false : _d;
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
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
const STRING_FUNCTION_USEABLE = functionConstructorAvailable();
function SceneChangeDetection(opts) {
    const { changeCb, convertor } = opts !== null && opts !== void 0 ? opts : {};
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;
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
    const { redraw = RedrawType.TRIVIAL, type = 'normal', checkDirtyOnAssignment = false } = opts !== null && opts !== void 0 ? opts : {};
    // Optimised code-path.
    // Remove all conditional logic from runtime - generate a setter with the exact necessary
    // steps, as these setters are called a LOT during update cycles.
    const setterJs = new Function('value', `
        const oldValue = this.${privateKey};
        if (value !== oldValue) {
            this.${privateKey} = value;
            ${type === 'normal' ? `this.markDirty(this, ${redraw});` : ''}
            ${type === 'transform' ? `this.markDirtyTransform(${redraw});` : ''}
            ${type === 'path'
        ? `if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, ${redraw}); }`
        : ''}
            ${type === 'font'
        ? `if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, ${redraw}); }`
        : ''}
        }
        ${checkDirtyOnAssignment
        ? `if (value != null && value._dirty > ${RedrawType.NONE}) { this.markDirty(value, value._dirty); }`
        : ''}
`);
    const getterJs = new Function(`return this.${privateKey};`);
    Object.defineProperty(target, key, {
        set: setterJs,
        get: getterJs,
        enumerable: true,
        configurable: true,
    });
}
function prepareSlowGetSet(target, key, privateKey, opts) {
    const { redraw = RedrawType.TRIVIAL, type = 'normal', changeCb, convertor, checkDirtyOnAssignment = false, } = opts !== null && opts !== void 0 ? opts : {};
    // Unoptimised but 'safe' code-path, for environments with CSP headers and no 'unsafe-eval'.
    // We deliberately do not support debug branches found in the optimised path above, since
    // for large data-set series performance deteriorates with every extra branch here.
    const setter = function (value) {
        const oldValue = this[privateKey];
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
    const getter = function () {
        return this[privateKey];
    };
    Object.defineProperty(target, key, {
        set: setter,
        get: getter,
        enumerable: true,
        configurable: true,
    });
}
class ChangeDetectable {
    constructor() {
        this._dirty = RedrawType.MAJOR;
    }
    markDirty(_source, type = RedrawType.TRIVIAL) {
        if (this._dirty > type) {
            return;
        }
        this._dirty = type;
    }
    markClean(_opts) {
        this._dirty = RedrawType.NONE;
    }
    isDirty() {
        return this._dirty > RedrawType.NONE;
    }
}
exports.ChangeDetectable = ChangeDetectable;

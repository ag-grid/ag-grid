"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const window_1 = require("../util/window");
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
const EVAL_USEABLE = evalAvailable();
function SceneChangeDetection(opts) {
    const { redraw = RedrawType.TRIVIAL, type = 'normal', changeCb, convertor, checkDirtyOnAssignment = false, } = opts || {};
    const debug = window_1.windowValue('agChartsSceneChangeDetectionDebug') != null;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;
        if (target[key]) {
            return;
        }
        if (EVAL_USEABLE) {
            // Optimised code-path.
            // Remove all conditional logic from runtime - generate a setter with the exact necessary
            // steps, as these setters are called a LOT during update cycles.
            const setterJs = `
                ${debug ? 'var setCount = 0;' : ''}
                function set_${key}(value) {
                    const oldValue = this.${privateKey};
                    ${convertor ? 'value = convertor(value);' : ''}
                    if (value !== oldValue) {
                        this.${privateKey} = value;
                        ${debug
                ? `console.log({ t: this, property: '${key}', oldValue, value, stack: new Error().stack });`
                : ''}
                        ${type === 'normal' ? `this.markDirty(this, ${redraw});` : ''}
                        ${type === 'transform' ? `this.markDirtyTransform(${redraw});` : ''}
                        ${type === 'path'
                ? `if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, ${redraw}); }`
                : ''}
                        ${type === 'font'
                ? `if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, ${redraw}); }`
                : ''}
                        ${changeCb ? 'changeCb(this);' : ''}
                    }
                    ${checkDirtyOnAssignment
                ? `if (value != null && value._dirty > ${RedrawType.NONE}) { this.markDirty(value, value._dirty); }`
                : ''}
                };
                set_${key};
            `;
            const getterJs = `
                function get_${key}() {
                    return this.${privateKey};
                };
                get_${key};
            `;
            Object.defineProperty(target, key, {
                set: eval(setterJs),
                get: eval(getterJs),
                enumerable: true,
                configurable: false,
            });
        }
        else {
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
                configurable: false,
            });
        }
    };
}
exports.SceneChangeDetection = SceneChangeDetection;
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

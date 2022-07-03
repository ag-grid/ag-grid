import { windowValue } from "../util/window";
export var RedrawType;
(function (RedrawType) {
    RedrawType[RedrawType["NONE"] = 0] = "NONE";
    // Canvas doesn't need clearing, an incremental re-rerender is sufficient.
    RedrawType[RedrawType["TRIVIAL"] = 1] = "TRIVIAL";
    // Group needs clearing, a semi-incremental re-render is sufficient.
    RedrawType[RedrawType["MINOR"] = 2] = "MINOR";
    // Canvas needs to be cleared for these redraw types.
    RedrawType[RedrawType["MAJOR"] = 3] = "MAJOR";
})(RedrawType || (RedrawType = {}));
export function SceneChangeDetection(opts) {
    var _a = opts || {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.TRIVIAL : _b, _c = _a.type, type = _c === void 0 ? 'normal' : _c, changeCb = _a.changeCb, convertor = _a.convertor, _d = _a.checkDirtyOnAssignment, checkDirtyOnAssignment = _d === void 0 ? false : _d;
    var debug = windowValue('agChartsSceneChangeDetectionDebug') != null;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        if (!target[key]) {
            // Remove all conditional logic from runtime - generate a setter with the exact necessary
            // steps, as these setters are called a LOT during update cycles.        
            var setterJs = "\n                " + (debug ? 'var setCount = 0;' : '') + "\n                function set_" + key + "(value) {\n                    const oldValue = this." + privateKey + ";\n                    " + (convertor ? 'value = convertor(value);' : '') + "\n                    if (value !== oldValue) {\n                        this." + privateKey + " = value;\n                        " + (debug ? "console.log({ t: this, property: '" + key + "', oldValue, value, stack: new Error().stack });" : '') + "\n                        " + (type === 'normal' ? 'this.markDirty(this, ' + redraw + ');' : '') + "\n                        " + (type === 'transform' ? 'this.markDirtyTransform(' + redraw + ');' : '') + "\n                        " + (type === 'path' ? "if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, redraw); }" : '') + "\n                        " + (type === 'font' ? "if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, redraw); }" : '') + "\n                        " + (changeCb ? 'changeCb(this);' : '') + "\n                    }\n                    " + (checkDirtyOnAssignment ? "if (value != null && value._dirty > " + RedrawType.NONE + ") { this.markDirty(value, value._dirty); }" : '') + "\n                };\n                set_" + key + ";\n            ";
            var getterJs = "\n                function get_" + key + "() {\n                    return this." + privateKey + ";\n                };\n                get_" + key + ";\n            ";
            Object.defineProperty(target, key, {
                set: eval(setterJs),
                get: eval(getterJs),
                enumerable: true,
                configurable: false,
            });
        }
    };
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
    ChangeDetectable.prototype.markClean = function (opts) {
        this._dirty = RedrawType.NONE;
    };
    ChangeDetectable.prototype.isDirty = function () {
        return this._dirty > RedrawType.NONE;
    };
    return ChangeDetectable;
}());
export { ChangeDetectable };
//# sourceMappingURL=changeDetectable.js.map
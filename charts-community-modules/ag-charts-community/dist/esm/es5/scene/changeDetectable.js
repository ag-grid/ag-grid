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
export function SceneChangeDetection(opts) {
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
export { ChangeDetectable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlRGV0ZWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9jaGFuZ2VEZXRlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBTixJQUFZLFVBV1g7QUFYRCxXQUFZLFVBQVU7SUFDbEIsMkNBQUksQ0FBQTtJQUVKLDBFQUEwRTtJQUMxRSxpREFBTyxDQUFBO0lBRVAsb0VBQW9FO0lBQ3BFLDZDQUFLLENBQUE7SUFFTCxxREFBcUQ7SUFDckQsNkNBQUssQ0FBQTtBQUNULENBQUMsRUFYVyxVQUFVLEtBQVYsVUFBVSxRQVdyQjtBQVVELG9GQUFvRjtBQUNwRixTQUFTLDRCQUE0QjtJQUNqQyxJQUFJO1FBQ0EsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBRUQsSUFBTSx1QkFBdUIsR0FBRyw0QkFBNEIsRUFBRSxDQUFDO0FBRS9ELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxJQUFrQztJQUM3RCxJQUFBLEtBQTBCLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsRUFBbEMsUUFBUSxjQUFBLEVBQUUsU0FBUyxlQUFlLENBQUM7SUFFM0MsT0FBTyxVQUFVLE1BQVcsRUFBRSxHQUFXO1FBQ3JDLGtGQUFrRjtRQUNsRixJQUFNLFVBQVUsR0FBRyxPQUFLLEdBQUssQ0FBQztRQUU5QixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNiLE9BQU87U0FDVjtRQUVELElBQUksdUJBQXVCLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ2xFLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BEO2FB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
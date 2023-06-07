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
const STRING_FUNCTION_USEABLE = functionConstructorAvailable();
export function SceneChangeDetection(opts) {
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
export class ChangeDetectable {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlRGV0ZWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9jaGFuZ2VEZXRlY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBTixJQUFZLFVBV1g7QUFYRCxXQUFZLFVBQVU7SUFDbEIsMkNBQUksQ0FBQTtJQUVKLDBFQUEwRTtJQUMxRSxpREFBTyxDQUFBO0lBRVAsb0VBQW9FO0lBQ3BFLDZDQUFLLENBQUE7SUFFTCxxREFBcUQ7SUFDckQsNkNBQUssQ0FBQTtBQUNULENBQUMsRUFYVyxVQUFVLEtBQVYsVUFBVSxRQVdyQjtBQVVELG9GQUFvRjtBQUNwRixTQUFTLDRCQUE0QjtJQUNqQyxJQUFJO1FBQ0EsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBRUQsTUFBTSx1QkFBdUIsR0FBRyw0QkFBNEIsRUFBRSxDQUFDO0FBRS9ELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxJQUFrQztJQUNuRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsQ0FBQztJQUUzQyxPQUFPLFVBQVUsTUFBVyxFQUFFLEdBQVc7UUFDckMsa0ZBQWtGO1FBQ2xGLE1BQU0sVUFBVSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFOUIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDYixPQUFPO1NBQ1Y7UUFFRCxJQUFJLHVCQUF1QixJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksU0FBUyxJQUFJLElBQUksRUFBRTtZQUNsRSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNwRDthQUFN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
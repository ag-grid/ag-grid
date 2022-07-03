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
    const { redraw = RedrawType.TRIVIAL, type = 'normal', changeCb, convertor, checkDirtyOnAssignment = false } = opts || {};
    const debug = windowValue('agChartsSceneChangeDetectionDebug') != null;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;
        if (!target[key]) {
            // Remove all conditional logic from runtime - generate a setter with the exact necessary
            // steps, as these setters are called a LOT during update cycles.        
            const setterJs = `
                ${debug ? 'var setCount = 0;' : ''}
                function set_${key}(value) {
                    const oldValue = this.${privateKey};
                    ${convertor ? 'value = convertor(value);' : ''}
                    if (value !== oldValue) {
                        this.${privateKey} = value;
                        ${debug ? `console.log({ t: this, property: '${key}', oldValue, value, stack: new Error().stack });` : ''}
                        ${type === 'normal' ? 'this.markDirty(this, ' + redraw + ');' : ''}
                        ${type === 'transform' ? 'this.markDirtyTransform(' + redraw + ');' : ''}
                        ${type === 'path' ? `if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, redraw); }` : ''}
                        ${type === 'font' ? `if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, redraw); }` : ''}
                        ${changeCb ? 'changeCb(this);' : ''}
                    }
                    ${checkDirtyOnAssignment ? `if (value != null && value._dirty > ${RedrawType.NONE}) { this.markDirty(value, value._dirty); }` : ''}
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
    };
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
    markClean(opts) {
        this._dirty = RedrawType.NONE;
    }
    isDirty() {
        return this._dirty > RedrawType.NONE;
    }
}
//# sourceMappingURL=changeDetectable.js.map
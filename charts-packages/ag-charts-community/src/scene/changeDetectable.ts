import { windowValue } from '../util/window';

export enum RedrawType {
    NONE, // No change in rendering.

    // Canvas doesn't need clearing, an incremental re-rerender is sufficient.
    TRIVIAL, // Non-positional change in rendering.

    // Group needs clearing, a semi-incremental re-render is sufficient.
    MINOR, // Small change in rendering, potentially affecting other elements in the same group.

    // Canvas needs to be cleared for these redraw types.
    MAJOR, // Significant change in rendering.
}

export type SceneChangeDetectionOptions = {
    redraw?: RedrawType;
    type?: 'normal' | 'transform' | 'path' | 'font';
    convertor?: (o: any) => any;
    changeCb?: (o: any) => any;
    checkDirtyOnAssignment?: boolean;
};

/** @returns true if eval() is disabled in the current execution context. */
function evalAvailable() {
    try {
        eval('');
        return true;
    } catch (e) {
        return false;
    }
}

const EVAL_USEABLE = evalAvailable();

export function SceneChangeDetection(opts?: SceneChangeDetectionOptions) {
    const {
        redraw = RedrawType.TRIVIAL,
        type = 'normal',
        changeCb,
        convertor,
        checkDirtyOnAssignment = false,
    } = opts || {};

    const debug = windowValue('agChartsSceneChangeDetectionDebug') != null;

    return function (target: any, key: string) {
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
                        ${
                            debug
                                ? `console.log({ t: this, property: '${key}', oldValue, value, stack: new Error().stack });`
                                : ''
                        }
                        ${type === 'normal' ? `this.markDirty(this, ${redraw});` : ''}
                        ${type === 'transform' ? `this.markDirtyTransform(${redraw});` : ''}
                        ${
                            type === 'path'
                                ? `if (!this._dirtyPath) { this._dirtyPath = true; this.markDirty(this, ${redraw}); }`
                                : ''
                        }
                        ${
                            type === 'font'
                                ? `if (!this._dirtyFont) { this._dirtyFont = true; this.markDirty(this, ${redraw}); }`
                                : ''
                        }
                        ${changeCb ? 'changeCb(this);' : ''}
                    }
                    ${
                        checkDirtyOnAssignment
                            ? `if (value != null && value._dirty > ${RedrawType.NONE}) { this.markDirty(value, value._dirty); }`
                            : ''
                    }
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
                configurable: true,
            });
        } else {
            // Unoptimised but 'safe' code-path, for environments with CSP headers and no 'unsafe-eval'.
            // We deliberately do not support debug branches found in the optimised path above, since
            // for large data-set series performance deteriorates with every extra branch here.
            const setter = function (value: any) {
                const oldValue = this[privateKey];
                value = convertor ? convertor(value) : value;
                if (value !== oldValue) {
                    this[privateKey] = value;
                    if (type === 'normal') this.markDirty(this, redraw);
                    if (type === 'transform') this.markDirtyTransform(redraw);
                    if (type === 'path' && !this._dirtyPath) {
                        this._dirtyPath = true;
                        this.markDirty(this, redraw);
                    }
                    if (type === 'font' && !this._dirtyFont) {
                        this._dirtyFont = true;
                        this.markDirty(this, redraw);
                    }
                    if (changeCb) changeCb(this);
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
    };
}

export abstract class ChangeDetectable {
    protected _dirty: RedrawType = RedrawType.MAJOR;

    protected markDirty(_source: any, type = RedrawType.TRIVIAL) {
        if (this._dirty > type) {
            return;
        }

        this._dirty = type;
    }

    markClean(_opts?: { force?: boolean; recursive?: boolean }) {
        this._dirty = RedrawType.NONE;
    }

    isDirty(): boolean {
        return this._dirty > RedrawType.NONE;
    }
}

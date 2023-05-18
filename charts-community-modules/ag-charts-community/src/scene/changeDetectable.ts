export enum RedrawType {
    NONE, // No change in rendering.

    // Canvas doesn't need clearing, an incremental re-rerender is sufficient.
    TRIVIAL, // Non-positional change in rendering.

    // Group needs clearing, a semi-incremental re-render is sufficient.
    MINOR, // Small change in rendering, potentially affecting other elements in the same group.

    // Canvas needs to be cleared for these redraw types.
    MAJOR, // Significant change in rendering.
}

type SceneChangeDetectionOptions = {
    redraw?: RedrawType;
    type?: 'normal' | 'transform' | 'path' | 'font';
    convertor?: (o: any) => any;
    changeCb?: (o: any) => any;
    checkDirtyOnAssignment?: boolean;
};

/** @returns true if new Function() is disabled in the current execution context. */
function functionConstructorAvailable() {
    try {
        new Function('return true');
        return true;
    } catch (e) {
        return false;
    }
}

const STRING_FUNCTION_USEABLE = functionConstructorAvailable();

export function SceneChangeDetection(opts?: SceneChangeDetectionOptions) {
    const { changeCb, convertor } = opts ?? {};

    return function (target: any, key: string) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        if (target[key]) {
            return;
        }

        if (STRING_FUNCTION_USEABLE && changeCb == null && convertor == null) {
            prepareFastGetSet(target, key, privateKey, opts);
        } else {
            prepareSlowGetSet(target, key, privateKey, opts);
        }
    };
}

function prepareFastGetSet(target: any, key: string, privateKey: string, opts?: SceneChangeDetectionOptions) {
    const { redraw = RedrawType.TRIVIAL, type = 'normal', checkDirtyOnAssignment = false } = opts ?? {};
    // Optimised code-path.

    // Remove all conditional logic from runtime - generate a setter with the exact necessary
    // steps, as these setters are called a LOT during update cycles.
    const setterJs = new Function(
        'value',
        `
        const oldValue = this.${privateKey};
        if (value !== oldValue) {
            this.${privateKey} = value;
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
        }
        ${
            checkDirtyOnAssignment
                ? `if (value != null && value._dirty > ${RedrawType.NONE}) { this.markDirty(value, value._dirty); }`
                : ''
        }
`
    );
    const getterJs = new Function(`return this.${privateKey};`);
    Object.defineProperty(target, key, {
        set: setterJs as () => void,
        get: getterJs as () => any,
        enumerable: true,
        configurable: true,
    });
}

function prepareSlowGetSet(target: any, key: string, privateKey: string, opts?: SceneChangeDetectionOptions) {
    const {
        redraw = RedrawType.TRIVIAL,
        type = 'normal',
        changeCb,
        convertor,
        checkDirtyOnAssignment = false,
    } = opts ?? {};

    // Unoptimised but 'safe' code-path, for environments with CSP headers and no 'unsafe-eval'.
    // We deliberately do not support debug branches found in the optimised path above, since
    // for large data-set series performance deteriorates with every extra branch here.
    const setter = function (this: any, value: any) {
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
    const getter = function (this: any) {
        return this[privateKey];
    };
    Object.defineProperty(target, key, {
        set: setter,
        get: getter,
        enumerable: true,
        configurable: true,
    });
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

export function Validate(predicate: (v: any) => boolean) {
    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        if (!target[key]) {
            const setter = function(v: any) {
                if (predicate(v)) {
                    this[privateKey] = v;
                    return;
                }

                console.warn(`AG Charts - Property [${target.constructor?.name ?? target.className}.${key}] cannot be set to [${v}], ignoring.`);
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
    }
}

export const BOOLEAN = (v: any) => v === true || v === false;
export const OPT_BOOLEAN = (v: any) => v === undefined || v === true || v === false;

export const STRING = (v: any) => typeof v === 'string';
export const OPT_STRING = (v: any) => v === undefined || typeof v === 'string';

export function OPT_NUMBER(min?: number, max?: number) {
    return (v: any) => v === undefined || 
        typeof v === 'number' && v >= (min ?? -Infinity) && v <= (max ?? Infinity);
}
export function NUMBER(min?: number, max?: number) {
    return (v: any) => typeof v === 'number' && v >= (min ?? -Infinity) && v <= (max ?? Infinity);
}

const FONT_WEIGHTS = ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
export const OPT_FONT_STYLE = (v: any) => v === undefined || v === 'normal' || v === 'italic' || v === 'oblique';
export const OPT_FONT_WEIGHT = (v: any) => v === undefined || FONT_WEIGHTS.includes(v);
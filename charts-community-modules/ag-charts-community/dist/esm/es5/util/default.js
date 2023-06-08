import { addTransformToInstanceProperty } from './decorator';
export function Default(defaultValue, replaces) {
    if (replaces === void 0) { replaces = [undefined]; }
    return addTransformToInstanceProperty(function (_, __, v) {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}

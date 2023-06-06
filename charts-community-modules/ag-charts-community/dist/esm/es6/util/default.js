import { addTransformToInstanceProperty } from './decorator';
export function Default(defaultValue, replaces = [undefined]) {
    return addTransformToInstanceProperty((_, __, v) => {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}

import { addTransformToInstanceProperty } from './decorator';

export function Default(defaultValue: any, replaces = [undefined]) {
    return addTransformToInstanceProperty((_, __, v: any) => {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}

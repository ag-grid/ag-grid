import { addTransformToInstanceProperty, BREAK_TRANSFORM_CHAIN } from './decorator';
import { Logger } from './logger';

export function createDeprecationWarning() {
    return (key: string, message?: string) => {
        const msg = [`Property [${key}] is deprecated.`, message].filter((v) => v != null).join(' ');
        Logger.warnOnce(msg);
    };
}

export function Deprecated(message?: string, opts?: { default?: any }) {
    const def = opts?.default;
    const warn = createDeprecationWarning();

    return addTransformToInstanceProperty((_, key, value) => {
        if (value !== def) {
            warn(key.toString(), message);
        }
        return value;
    });
}

export function DeprecatedAndRenamedTo(newPropName: any, mapValue?: (value: any) => any) {
    const warnDeprecated = createDeprecationWarning();

    return addTransformToInstanceProperty(
        (target, key, value) => {
            if (value !== target[newPropName]) {
                warnDeprecated(key.toString(), `Use [${newPropName}] instead.`);
                target[newPropName] = mapValue ? mapValue(value) : value;
            }
            return BREAK_TRANSFORM_CHAIN;
        },
        (target, key) => {
            warnDeprecated(key.toString(), `Use [${newPropName}] instead.`);
            return target[newPropName];
        }
    );
}

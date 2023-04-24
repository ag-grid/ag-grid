import { addTransformToInstanceProperty, BREAK_TRANSFORM_CHAIN } from './decorator';
import { Logger } from './logger';
export function createDeprecationWarning() {
    return function (key, message) {
        var msg = ["Property [" + key + "] is deprecated.", message].filter(function (v) { return v != null; }).join(' ');
        Logger.warnOnce(msg);
    };
}
export function Deprecated(message, opts) {
    var def = opts === null || opts === void 0 ? void 0 : opts.default;
    var warn = createDeprecationWarning();
    return addTransformToInstanceProperty(function (_, key, value) {
        if (value !== def) {
            warn(key.toString(), message);
        }
        return value;
    });
}
export function DeprecatedAndRenamedTo(newPropName, mapValue) {
    var warnDeprecated = createDeprecationWarning();
    return addTransformToInstanceProperty(function (target, key, value) {
        if (value !== target[newPropName]) {
            warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
            target[newPropName] = mapValue ? mapValue(value) : value;
        }
        return BREAK_TRANSFORM_CHAIN;
    }, function (target, key) {
        warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
        return target[newPropName];
    });
}

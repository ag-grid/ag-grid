export function createDeprecationWarning() {
    let logged = false;
    return (key: string, message?: string) => {
        if (logged) {
            return;
        }
        const msg = [`AG Charts - Property [${key}] is deprecated.`, message].filter((v) => v != null).join(' ');
        console.warn(msg);
        logged = true;
    };
}

export function Deprecated(message?: string, opts?: { default?: any }) {
    const def = opts?.default;
    const warn = createDeprecationWarning();

    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }

        const symbol = Symbol(`__${key}__`);
        Object.defineProperty(target, key, {
            get: function () {
                return this[symbol];
            },
            set: function (value: any) {
                if (value !== def) {
                    warn(key, message);
                }
                this[symbol] = value;
            },
            enumerable: true,
            configurable: true,
        });
    };
}

export function DeprecatedAndRenamedTo(newPropName: any) {
    const warnDeprecated = createDeprecationWarning();

    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }

        const warnRenamed = () => warnDeprecated(key, `Use [${newPropName}] instead.`);
        Object.defineProperty(target, key, {
            get: function () {
                warnRenamed();
                return this[newPropName];
            },
            set: function (value: any) {
                if (value !== this[newPropName]) {
                    warnRenamed();
                    this[newPropName] = value;
                }
            },
            enumerable: true,
            configurable: false,
        });
    };
}

export enum ChangeDetectionStrategyType {
    IdentityCheck = 'IdentityCheck',
    DeepValueCheck = 'DeepValueCheck',
    NoCheck = 'NoCheck'
}

export class ChangeDetectionService {
    private strategyMap: { [key in ChangeDetectionStrategyType]: ChangeDetectionStrategy } = {
        [ChangeDetectionStrategyType.DeepValueCheck]: new DeepValueStrategy(),
        [ChangeDetectionStrategyType.IdentityCheck]: new SimpleFunctionalStrategy((a, b) => a === b),
        [ChangeDetectionStrategyType.NoCheck]: new SimpleFunctionalStrategy((a, b) => true)
    };

    public getStrategy(changeDetectionStrategy: ChangeDetectionStrategyType): ChangeDetectionStrategy {
        return this.strategyMap[changeDetectionStrategy];
    }
}

export interface ChangeDetectionStrategy {
    areEqual(a: any, b: any): boolean;
}

class SimpleFunctionalStrategy implements ChangeDetectionStrategy {
    private strategy: (a: any, b: any) => boolean;

    constructor(strategy: (a: any, b: any) => boolean) {
        this.strategy = strategy;
    }

    areEqual(a: any, b: any): boolean {
        return this.strategy(a, b);
    }
}

class DeepValueStrategy implements ChangeDetectionStrategy {
    areEqual(a: any, b: any): boolean {
        return DeepValueStrategy.areEquivalent(DeepValueStrategy.copy(a), DeepValueStrategy.copy(b));
    }

    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    static unwrapStringOrNumber(obj: any) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    }

    // sigh, here for ie compatibility
    static copy(value: any): any {
        if (!value) {
            return value;
        }

        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            const arrayCopy = [];
            for (let i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }

        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them, IE will fail (correctly, imho)
        if (typeof value !== "object") {
            return value;
        }

        return [{}, value].reduce((r, o) => {
            Object.keys(o).forEach(function (k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }

    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    static areEquivalent(a: any, b: any) {
        a = DeepValueStrategy.unwrapStringOrNumber(a);
        b = DeepValueStrategy.unwrapStringOrNumber(b);
        if (a === b) return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b) return false;
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            return a.toString() === b.toString();
        }
        if (typeof a !== "object") {
            return a == b; //for boolean, number, string, function, xml
        }

        const newA = a.areEquivPropertyTracking === undefined,
            newB = b.areEquivPropertyTracking === undefined;
        try {
            let prop;
            if (newA) {
                a.areEquivPropertyTracking = [];
            } else if (
                a.areEquivPropertyTracking.some(function (other: any) {
                    return other === b;
                })
            )
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            } else if (b.areEquivPropertyTracking.some((other: any) => other === a)) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);

            const tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }

            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        } finally {
            if (newA) delete a.areEquivPropertyTracking;
            if (newB) delete b.areEquivPropertyTracking;
        }
    }
}

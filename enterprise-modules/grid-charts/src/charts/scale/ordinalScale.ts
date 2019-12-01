import Scale from "./scale";

/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export class OrdinalScale<D, R> implements Scale<D, R> {
    unknown: R;

    /**
     * Using an object as a map prevents us from uniquely identifying objects and arrays:
     *
     *     index[{}]   === index[{foo: 'bar'}]    // true
     *     index[[{}]] === index[[{foo: 'bar'}]]  // true
     *
     * Use `Map` when IE11 is irrelevant.
     */
    private index: { [key: string]: number } = {}; // new Map<D, number>();

    private _domain: D[] = [];
    set domain(values: D[]) {
        const domain = this._domain;
        const index = this.index = {} as { [key: string]: number };

        domain.length = 0;
        values.forEach(d => {
            const key = d + '';
            if (!index[key]) {
                index[key] = domain.push(d);
            }
        });
    }
    get domain(): D[] {
        return this._domain;
    }

    private _range: R[] = [];
    set range(values: R[]) {
        const n = values.length;
        const range = this._range;
        range.length = n;
        for (let i = 0; i < n; i++) {
            range[i] = values[i];
        }
    }
    get range(): R[] {
        return this._range;
    }

    convert(d: D): R {
        // Since `d` in `this.index[d]` will be implicitly converted to a string
        // anyway, we explicitly convert it, because we might have to use it twice.
        const key = d + '';
        let i = this.index[key];
        if (!i) {
            if (this.unknown !== undefined) {
                return this.unknown;
            }
            this.index[key] = i = this.domain.push(d);
        }
        return this.range[(i - 1) % this.range.length];
    }
}

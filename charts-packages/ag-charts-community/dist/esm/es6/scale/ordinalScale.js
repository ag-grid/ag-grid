/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export class OrdinalScale {
    constructor() {
        this.type = 'ordinal';
        /**
         * Using an object as a map prevents us from uniquely identifying objects and arrays:
         *
         *     index[{}]   === index[{foo: 'bar'}]    // true
         *     index[[{}]] === index[[{foo: 'bar'}]]  // true
         *
         * Use `Map` when IE11 is irrelevant.
         */
        this.index = {}; // new Map<D, number>();
        this._domain = [];
        this._range = [];
    }
    set domain(values) {
        const domain = this._domain;
        const index = (this.index = {});
        domain.length = 0;
        values.forEach((d) => {
            const key = d + '';
            if (!index[key]) {
                index[key] = domain.push(d);
            }
        });
    }
    get domain() {
        return this._domain;
    }
    set range(values) {
        const n = values.length;
        const range = this._range;
        range.length = n;
        for (let i = 0; i < n; i++) {
            range[i] = values[i];
        }
    }
    get range() {
        return this._range;
    }
    convert(d) {
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

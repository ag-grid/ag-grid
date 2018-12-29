import Scale from "./scale";

/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export class OrdinalScale<D, R> implements Scale<D, R> {
    unknown: R;

    _domain: D[] = [];
    set domain(values: D[]) {
        const domain = this._domain;
        const index = this.index = {} as any;

        domain.length = 0;
        values.forEach(value => {
            if (index[value] === undefined) {
                domain.push(value);
                index[value] = domain.length - 1;
            }
        });
    }
    get domain(): D[] {
        return this._domain;
    }

    _range: R[] = [];
    set range(values: R[]) {
        this._range.length = 0;
        this._range.push(...values);
    }
    get range(): R[] {
        return this._range;
    }

    private index = {} as any; // new Map<D, number>();

    convert(d: D): R {
        let i = this.index[d];
        if (i === undefined) {
            this.domain.push(d);
            this.index[d] = i = this.domain.length - 1;
        }

        const range = this.range;
        if (range.length === 0) {
            return this.unknown;
        }
        return range[i % range.length];
    }
}

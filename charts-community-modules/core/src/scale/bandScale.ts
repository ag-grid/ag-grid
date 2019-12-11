import Scale from './scale';

/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
export class BandScale<D> implements Scale<D, number> {

    /**
     * Maps datum to its index in the {@link domain} array.
     * Used to check for duplicate datums (not allowed).
     */
    private index = new Map<D, number>();

    /**
     * The output range values for datum at each index.
     */
    private ordinalRange: number[] = [];

    /**
     * Contains unique datums only. Since `{}` is used in place of `Map`
     * for IE11 compatibility, the datums are converted `toString` before
     * the uniqueness check.
     */
    private _domain: D[] = [];
    set domain(values: D[]) {
        const domain = this._domain;
        domain.length = 0;

        this.index = new Map<D, number>();
        const index = this.index;

        // In case one wants to have duplicate domain values, for example, two 'Italy' categories,
        // one should use objects rather than strings for domain values like so:
        // { toString: () => 'Italy' }
        // { toString: () => 'Italy' }
        values.forEach(value => {
            if (index.get(value) === undefined) {
                index.set(value, domain.push(value) - 1);
            }
        });

        this.rescale();
    }
    get domain(): D[] {
        return this._domain;
    }

    private _range: [number, number] = [0, 1];
    set range(values: [number, number]) {
        this._range[0] = values[0];
        this._range[1] = values[1];
        this.rescale();
    }
    get range(): [number, number] {
        return this._range;
    }

    ticks(): D[] {
        return this._domain;
    }

    convert(d: D): number {
        const i = this.index.get(d);
        if (i === undefined) {
            return NaN;
        }

        const r = this.ordinalRange[i];
        if (r === undefined) {
            return NaN;
        }

        return r;
    }

    private _bandwidth: number = 1;
    get bandwidth(): number {
        return this._bandwidth;
    }

    set padding(value: number) {
        value = Math.max(0, Math.min(1, value));
        this._paddingInner = value;
        this._paddingOuter = value;
        this.rescale();
    }
    get padding(): number {
        return this._paddingInner;
    }

    /**
     * The ratio of the range that is reserved for space between bands.
     */
    private _paddingInner = 0;
    set paddingInner(value: number) {
        this._paddingInner = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get paddingInner(): number {
        return this._paddingInner;
    }

    /**
     * The ratio of the range that is reserved for space before the first
     * and after the last band.
     */
    private _paddingOuter = 0;
    set paddingOuter(value: number) {
        this._paddingOuter = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get paddingOuter(): number {
        return this._paddingOuter;
    }

    private _round = false;
    set round(value: boolean) {
        this._round = value;
        this.rescale();
    }
    get round(): boolean {
        return this._round;
    }

    /**
     * How the leftover range is distributed.
     * `0.5` - equal distribution of space before the first and after the last band,
     * with bands effectively centered within the range.
     */
    private _align = 0.5;
    set align(value: number) {
        this._align = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get align(): number {
        return this._align;
    }

    protected rescale() {
        const n = this._domain.length;
        if (!n) {
            return;
        }

        let [a, b] =  this._range;
        const reversed = b < a;

        if (reversed) {
            [a, b] = [b, a];
        }
        let step = (b - a) / Math.max(1, n - this._paddingInner + this._paddingOuter * 2);
        if (this._round) {
            step = Math.floor(step);
        }
        a += (b - a - step * (n - this._paddingInner)) * this._align;
        this._bandwidth = step * (1 - this._paddingInner);
        if (this._round) {
            a = Math.round(a);
            this._bandwidth = Math.round(this._bandwidth);
        }

        const values: number[] = [];
        for (let i = 0; i < n ; i++) {
            values.push(a + step * i);
        }

        this.ordinalRange = reversed ? values.reverse() : values;
    }
}

/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
export class BandScale {
    constructor() {
        this.type = 'band';
        /**
         * Maps datum to its index in the {@link domain} array.
         * Used to check for duplicate datums (not allowed).
         */
        this.index = new Map();
        /**
         * The output range values for datum at each index.
         */
        this.ordinalRange = [];
        /**
         * Contains unique datums only. Since `{}` is used in place of `Map`
         * for IE11 compatibility, the datums are converted `toString` before
         * the uniqueness check.
         */
        this._domain = [];
        this._range = [0, 1];
        this._bandwidth = 1;
        this._rawBandwidth = 1;
        /**
         * The ratio of the range that is reserved for space between bands.
         */
        this._paddingInner = 0;
        /**
         * The ratio of the range that is reserved for space before the first
         * and after the last band.
         */
        this._paddingOuter = 0;
        this._round = false;
        /**
         * How the leftover range is distributed.
         * `0.5` - equal distribution of space before the first and after the last band,
         * with bands effectively centered within the range.
         */
        this._align = 0.5;
    }
    set domain(values) {
        const domain = this._domain;
        domain.length = 0;
        this.index = new Map();
        const index = this.index;
        // In case one wants to have duplicate domain values, for example, two 'Italy' categories,
        // one should use objects rather than strings for domain values like so:
        // { toString: () => 'Italy' }
        // { toString: () => 'Italy' }
        values.forEach((value) => {
            if (index.get(value) === undefined) {
                index.set(value, domain.push(value) - 1);
            }
        });
        this.rescale();
    }
    get domain() {
        return this._domain;
    }
    set range(values) {
        this._range[0] = values[0];
        this._range[1] = values[1];
        this.rescale();
    }
    get range() {
        return this._range;
    }
    ticks() {
        return this._domain;
    }
    convert(d) {
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
    get bandwidth() {
        return this._bandwidth;
    }
    get rawBandwidth() {
        return this._rawBandwidth;
    }
    set padding(value) {
        value = Math.max(0, Math.min(1, value));
        this._paddingInner = value;
        this._paddingOuter = value;
        this.rescale();
    }
    get padding() {
        return this._paddingInner;
    }
    set paddingInner(value) {
        this._paddingInner = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get paddingInner() {
        return this._paddingInner;
    }
    set paddingOuter(value) {
        this._paddingOuter = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get paddingOuter() {
        return this._paddingOuter;
    }
    set round(value) {
        this._round = value;
        this.rescale();
    }
    get round() {
        return this._round;
    }
    set align(value) {
        this._align = Math.max(0, Math.min(1, value)); // [0, 1]
        this.rescale();
    }
    get align() {
        return this._align;
    }
    rescale() {
        const n = this._domain.length;
        if (!n) {
            return;
        }
        let [a, b] = this._range;
        const reversed = b < a;
        if (reversed) {
            [a, b] = [b, a];
        }
        const rawStep = (b - a) / Math.max(1, n - this._paddingInner + this._paddingOuter * 2);
        let step = rawStep;
        if (this._round) {
            step = Math.floor(step);
        }
        a += (b - a - step * (n - this._paddingInner)) * this._align;
        this._bandwidth = step * (1 - this._paddingInner);
        this._rawBandwidth = rawStep * (1 - this._paddingInner);
        if (this._round) {
            a = Math.round(a);
            this._bandwidth = Math.round(this._bandwidth);
        }
        const values = [];
        for (let i = 0; i < n; i++) {
            values.push(a + step * i);
        }
        if (reversed) {
            values.reverse();
        }
        this.ordinalRange = values;
    }
}

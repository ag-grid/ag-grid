function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}
/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
export class BandScale {
    constructor() {
        this.type = 'band';
        this.cache = null;
        this.cacheProps = ['_domain', 'range', '_paddingInner', '_paddingOuter', 'round'];
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
        this.range = [0, 1];
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
        this.round = false;
    }
    didChange() {
        const { cache } = this;
        const didChange = !cache || this.cacheProps.some((p) => this[p] !== cache[p]);
        if (didChange) {
            this.cache = {};
            this.cacheProps.forEach((p) => (this.cache[p] = this[p]));
            return true;
        }
        return false;
    }
    refresh() {
        if (this.didChange()) {
            this.update();
        }
    }
    set domain(values) {
        const domain = [];
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
        this._domain = domain;
    }
    get domain() {
        return this._domain;
    }
    ticks() {
        this.refresh();
        return this._domain;
    }
    convert(d) {
        this.refresh();
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
        this.refresh();
        return this._bandwidth;
    }
    get rawBandwidth() {
        this.refresh();
        return this._rawBandwidth;
    }
    set padding(value) {
        value = clamp(value, 0, 1);
        this._paddingInner = value;
        this._paddingOuter = value;
    }
    get padding() {
        return this._paddingInner;
    }
    set paddingInner(value) {
        this._paddingInner = clamp(value, 0, 1);
    }
    get paddingInner() {
        return this._paddingInner;
    }
    set paddingOuter(value) {
        this._paddingOuter = clamp(value, 0, 1);
    }
    get paddingOuter() {
        return this._paddingOuter;
    }
    update() {
        const count = this._domain.length;
        if (count === 0) {
            return;
        }
        const round = this.round;
        const paddingInner = this._paddingInner;
        const paddingOuter = this._paddingOuter;
        const [r0, r1] = this.range;
        const width = r1 - r0;
        const rawStep = width / Math.max(1, count + 2 * paddingOuter - paddingInner);
        const step = round ? Math.floor(rawStep) : rawStep;
        const fullBandWidth = step * (count - paddingInner);
        const x0 = r0 + (width - fullBandWidth) / 2;
        const start = round ? Math.round(x0) : x0;
        const bw = step * (1 - paddingInner);
        const bandwidth = round ? Math.round(bw) : bw;
        const rawBandwidth = rawStep * (1 - paddingInner);
        const values = [];
        for (let i = 0; i < count; i++) {
            values.push(start + step * i);
        }
        this._bandwidth = bandwidth;
        this._rawBandwidth = rawBandwidth;
        this.ordinalRange = values;
    }
}

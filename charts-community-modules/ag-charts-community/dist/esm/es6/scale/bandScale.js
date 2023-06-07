function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}
/**
 * Maps a discrete domain to a continuous numeric range.
 */
export class BandScale {
    constructor() {
        this.type = 'band';
        this.cache = null;
        this.cacheProps = ['_domain', 'range', '_paddingInner', '_paddingOuter', 'round', 'interval'];
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
        const { interval = 1 } = this;
        const step = Math.abs(Math.round(interval));
        return this._domain.filter((_, i) => i % step === 0);
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
    invert(position) {
        this.refresh();
        const index = this.ordinalRange.findIndex((p) => p === position);
        return this.domain[index];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFuZFNjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjYWxlL2JhbmRTY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLEtBQUssQ0FBQyxDQUFTLEVBQUUsR0FBVyxFQUFFLEdBQVc7SUFDOUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ2EsU0FBSSxHQUFHLE1BQU0sQ0FBQztRQUlmLFVBQUssR0FBUSxJQUFJLENBQUM7UUFDbEIsZUFBVSxHQUFhLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQWtCM0c7OztXQUdHO1FBQ0ssVUFBSyxHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFFckM7O1dBRUc7UUFDSyxpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUVwQzs7OztXQUlHO1FBQ0ssWUFBTyxHQUFRLEVBQUUsQ0FBQztRQXVCMUIsVUFBSyxHQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBOEJqQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBZWxDOztXQUVHO1FBQ0ssa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFRMUI7OztXQUdHO1FBQ0ssa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFRMUIsVUFBSyxHQUFHLEtBQUssQ0FBQztJQWdDbEIsQ0FBQztJQWxLVyxTQUFTO1FBQ2IsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztRQUN2QixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FB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
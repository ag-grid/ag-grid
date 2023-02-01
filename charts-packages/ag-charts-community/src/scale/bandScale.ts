import { Scale } from './scale';

function clamp(x: number, min: number, max: number) {
    return Math.max(min, Math.min(max, x));
}

/**
 * Maps a discrete domain to a continuous numeric range.
 */
export class BandScale<D> implements Scale<D, number> {
    readonly type = 'band';

    interval?: number;

    private cache: any = null;
    private cacheProps: string[] = ['_domain', 'range', '_paddingInner', '_paddingOuter', 'round', 'interval'];
    private didChange() {
        const { cache } = this;
        const didChange = !cache || this.cacheProps.some((p) => this[p as keyof BandScale<any>] !== cache[p]);
        if (didChange) {
            this.cache = {};
            this.cacheProps.forEach((p) => (this.cache[p] = this[p as keyof BandScale<any>]));
            return true;
        }
        return false;
    }

    private refresh() {
        if (this.didChange()) {
            this.update();
        }
    }

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
        const domain: D[] = [];

        this.index = new Map<D, number>();
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
    get domain(): D[] {
        return this._domain;
    }

    range: number[] = [0, 1];

    ticks(): D[] {
        this.refresh();
        const { interval = 1 } = this;
        const step = Math.abs(Math.round(interval));
        return this._domain.filter((_, i) => i % step === 0);
    }

    convert(d: D): number {
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

    private _bandwidth: number = 1;
    get bandwidth(): number {
        this.refresh();
        return this._bandwidth;
    }

    private _rawBandwidth: number = 1;
    get rawBandwidth(): number {
        this.refresh();
        return this._rawBandwidth;
    }

    set padding(value: number) {
        value = clamp(value, 0, 1);
        this._paddingInner = value;
        this._paddingOuter = value;
    }
    get padding(): number {
        return this._paddingInner;
    }

    /**
     * The ratio of the range that is reserved for space between bands.
     */
    private _paddingInner = 0;
    set paddingInner(value: number) {
        this._paddingInner = clamp(value, 0, 1);
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
        this._paddingOuter = clamp(value, 0, 1);
    }
    get paddingOuter(): number {
        return this._paddingOuter;
    }

    round = false;

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

        const values: number[] = [];
        for (let i = 0; i < count; i++) {
            values.push(start + step * i);
        }

        this._bandwidth = bandwidth;
        this._rawBandwidth = rawBandwidth;
        this.ordinalRange = values;
    }
}

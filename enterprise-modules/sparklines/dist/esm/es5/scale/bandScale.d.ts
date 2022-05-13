import Scale from './scale';
/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
export declare class BandScale<D> implements Scale<D, number> {
    readonly type = "band";
    /**
     * Maps datum to its index in the {@link domain} array.
     * Used to check for duplicate datums (not allowed).
     */
    private index;
    /**
     * The output range values for datum at each index.
     */
    private ordinalRange;
    /**
     * Contains unique datums only. Since `{}` is used in place of `Map`
     * for IE11 compatibility, the datums are converted `toString` before
     * the uniqueness check.
     */
    private _domain;
    set domain(values: D[]);
    get domain(): D[];
    private _range;
    set range(values: number[]);
    get range(): number[];
    ticks(): D[];
    convert(d: D): number;
    private _bandwidth;
    get bandwidth(): number;
    set padding(value: number);
    get padding(): number;
    /**
     * The ratio of the range that is reserved for space between bands.
     */
    private _paddingInner;
    set paddingInner(value: number);
    get paddingInner(): number;
    /**
     * The ratio of the range that is reserved for space before the first
     * and after the last band.
     */
    private _paddingOuter;
    set paddingOuter(value: number);
    get paddingOuter(): number;
    private _round;
    set round(value: boolean);
    get round(): boolean;
    /**
     * How the leftover range is distributed.
     * `0.5` - equal distribution of space before the first and after the last band,
     * with bands effectively centered within the range.
     */
    private _align;
    set align(value: number);
    get align(): number;
    protected rescale(): void;
}

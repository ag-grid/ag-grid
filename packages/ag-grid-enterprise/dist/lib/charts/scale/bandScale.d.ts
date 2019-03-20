// ag-grid-enterprise v20.2.0
import Scale from './scale';
/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
export declare class BandScale<D> implements Scale<D, number> {
    private _domain;
    domain: D[];
    private _range;
    range: [number, number];
    ticks(): D[];
    convert(d: D): number;
    private ordinalRange;
    private index;
    private _bandwidth;
    readonly bandwidth: number;
    private _padding;
    padding: number;
    /**
     * The ratio of the range that is reserved for space between bands.
     */
    private _paddingInner;
    paddingInner: number;
    /**
     * The ratio of the range that is reserved for space before the first
     * and after the last band.
     */
    private _paddingOuter;
    paddingOuter: number;
    private _round;
    round: boolean;
    /**
     * How the leftover range is distributed.
     * `0.5` - equal distribution of space before the first and after the last band,
     * with bands effectively centered within the range.
     */
    private _align;
    align: number;
    protected rescale(): void;
}

// ag-grid-enterprise v20.1.0
import Scale from './scale';
/**
 * Maps a discrete domain to a continuous numeric range.
 */
export declare class BandScale<D> implements Scale<D, number> {
    _domain: D[];
    domain: D[];
    _range: [number, number];
    range: [number, number];
    ticks(): D[];
    convert(d: D): number;
    private ordinalRange;
    private index;
    _bandwidth: number;
    readonly bandwidth: number;
    _padding: number;
    padding: number;
    /**
     * The ratio of the range that is reserved for space between bands.
     */
    _paddingInner: number;
    paddingInner: number;
    /**
     * The ratio of the range that is reserved for space before the first
     * and after the last band.
     */
    _paddingOuter: number;
    paddingOuter: number;
    _round: boolean;
    round: boolean;
    /**
     * How the leftover range is distributed.
     * `0.5` - equal distribution of space before the first and after the last band,
     * with bands effectively centered within the range.
     */
    _align: number;
    align: number;
    protected rescale(): void;
}

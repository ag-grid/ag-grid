// ag-grid-enterprise v20.0.0
import Scale from "./scale";
/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export declare class OrdinalScale<D, R> implements Scale<D, R> {
    unknown: R;
    _domain: D[];
    domain: D[];
    _range: R[];
    range: R[];
    private index;
    convert(d: D): R;
}

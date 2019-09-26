// ag-grid-enterprise v21.2.2
import Scale from "./scale";
/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export declare class OrdinalScale<D, R> implements Scale<D, R> {
    unknown: R;
    /**
     * Using an object as a map prevents us from uniquely identifying objects and arrays:
     *
     *     index[{}]   === index[{foo: 'bar'}]    // true
     *     index[[{}]] === index[[{foo: 'bar'}]]  // true
     *
     * Use `Map` when IE11 is irrelevant.
     */
    private index;
    private _domain;
    domain: D[];
    private _range;
    range: R[];
    convert(d: D): R;
}

import { Scale } from './scale';
/**
 * Maps a discrete domain to a discrete range.
 * For example, a category index to its color.
 */
export declare class OrdinalScale<D, R> implements Scale<D, R> {
    readonly type = "ordinal";
    unknown?: R;
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
    set domain(values: D[]);
    get domain(): D[];
    private _range;
    set range(values: R[]);
    get range(): R[];
    convert(d: D): R;
}

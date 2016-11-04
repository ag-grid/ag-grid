/**
 * @experimental
 **/
export declare class QueryEncoder {
    encodeKey(k: string): string;
    encodeValue(v: string): string;
}
/**
 * Map-like representation of url search parameters, based on
 * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard,
 * with several extensions for merging URLSearchParams objects:
 *   - setAll()
 *   - appendAll()
 *   - replaceAll()
 *
 * This class accepts an optional second parameter of ${@link QueryEncoder},
 * which is used to serialize parameters before making a request. By default,
 * `QueryEncoder` encodes keys and values of parameters using `encodeURIComponent`,
 * and then un-encodes certain characters that are allowed to be part of the query
 * according to IETF RFC 3986: https://tools.ietf.org/html/rfc3986.
 *
 * These are the characters that are not encoded: `! $ \' ( ) * + , ; A 9 - . _ ~ ? /`
 *
 * If the set of allowed query characters is not acceptable for a particular backend,
 * `QueryEncoder` can be subclassed and provided as the 2nd argument to URLSearchParams.
 *
 * ```
 * import {URLSearchParams, QueryEncoder} from '@angular/http';
 * class MyQueryEncoder extends QueryEncoder {
 *   encodeKey(k: string): string {
 *     return myEncodingFunction(k);
 *   }
 *
 *   encodeValue(v: string): string {
 *     return myEncodingFunction(v);
 *   }
 * }
 *
 * let params = new URLSearchParams('', new MyQueryEncoder());
 * ```
 * @experimental
 */
export declare class URLSearchParams {
    rawParams: string;
    private queryEncoder;
    paramsMap: Map<string, string[]>;
    constructor(rawParams?: string, queryEncoder?: QueryEncoder);
    clone(): URLSearchParams;
    has(param: string): boolean;
    get(param: string): string;
    getAll(param: string): string[];
    set(param: string, val: string): void;
    setAll(searchParams: URLSearchParams): void;
    append(param: string, val: string): void;
    appendAll(searchParams: URLSearchParams): void;
    replaceAll(searchParams: URLSearchParams): void;
    toString(): string;
    delete(param: string): void;
}

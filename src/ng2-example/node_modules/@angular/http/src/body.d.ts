/**
 * HTTP request body used by both {@link Request} and {@link Response}
 * https://fetch.spec.whatwg.org/#body
 */
export declare abstract class Body {
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     */
    json(): any;
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     */
    text(): string;
    /**
     * Return the body as an ArrayBuffer
     */
    arrayBuffer(): ArrayBuffer;
    /**
      * Returns the request's body as a Blob, assuming that body exists.
      */
    blob(): Blob;
}

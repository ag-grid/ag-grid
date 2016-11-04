import { Body } from './body';
import { ContentType, RequestMethod, ResponseContentType } from './enums';
import { Headers } from './headers';
import { RequestArgs } from './interfaces';
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from '@angular/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 *
 * @experimental
 */
export declare class Request extends Body {
    /**
     * Http method with which to perform the request.
     */
    method: RequestMethod;
    /**
     * {@link Headers} instance
     */
    headers: Headers;
    /** Url of the remote resource */
    url: string;
    /** Type of the request body **/
    private contentType;
    /** Enable use credentials */
    withCredentials: boolean;
    /** Buffer to store the response */
    responseType: ResponseContentType;
    constructor(requestOptions: RequestArgs);
    /**
     * Returns the content type enum based on header options.
     */
    detectContentType(): ContentType;
    /**
     * Returns the content type of request's body based on its type.
     */
    detectContentTypeFromBody(): ContentType;
    /**
     * Returns the request's body according to its type. If body is undefined, return
     * null.
     */
    getBody(): any;
}

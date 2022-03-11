import { AgPromise } from "../utils";
export interface SimpleHttpRequestParams {
    url: string;
}
/**
 * @deprecated
 */
export declare function simpleHttpRequest(params: SimpleHttpRequestParams): AgPromise<any>;

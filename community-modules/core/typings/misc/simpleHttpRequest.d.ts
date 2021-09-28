import { AgPromise } from "../utils";
export interface SimpleHttpRequestParams {
    url: string;
}
export declare function simpleHttpRequest(params: SimpleHttpRequestParams): AgPromise<any>;

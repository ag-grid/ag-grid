// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgPromise } from "../utils";
export interface SimpleHttpRequestParams {
    url: string;
}
/**
 * @deprecated Since v29 simpleHttpRequest has been deprecated as it was only meant for use in internal AG Grid documentation examples. Please use the browser fetch api directly.
 */
export declare function simpleHttpRequest(params: SimpleHttpRequestParams): AgPromise<any>;

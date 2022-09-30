// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgPromise } from "../utils";
export interface SimpleHttpRequestParams {
    url: string;
}
/**
 * @deprecated
 */
export declare function simpleHttpRequest(params: SimpleHttpRequestParams): AgPromise<any>;

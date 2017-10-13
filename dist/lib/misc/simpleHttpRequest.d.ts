// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface SimpleHttpRequestParams {
    url: string;
}
export declare function simpleHttpRequest(params: SimpleHttpRequestParams): Promise;
export declare class Promise {
    private thenFunc;
    then(func: (result: any) => void): void;
    resolve(result: any): void;
}

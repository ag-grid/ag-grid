// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "./context/beanStub";
export declare class TemplateService extends BeanStub {
    private templateCache;
    private waitingCallbacks;
    getTemplate(url: any, callback: any): any;
    handleHttpResult(httpResult: any, url: any): void;
}

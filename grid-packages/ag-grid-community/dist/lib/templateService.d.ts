import { BeanStub } from "./context/beanStub";
export declare class TemplateService extends BeanStub {
    private templateCache;
    private waitingCallbacks;
    getTemplate(url: any, callback: any): any;
    handleHttpResult(httpResult: any, url: any): void;
}

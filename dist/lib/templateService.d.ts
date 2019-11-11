export declare class TemplateService {
    private $scope;
    private templateCache;
    private waitingCallbacks;
    getTemplate(url: any, callback: any): any;
    handleHttpResult(httpResult: any, url: any): void;
}

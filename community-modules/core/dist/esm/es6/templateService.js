/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
let TemplateService = class TemplateService extends BeanStub {
    constructor() {
        super(...arguments);
        this.templateCache = {};
        this.waitingCallbacks = {};
    }
    // returns the template if it is loaded, or null if it is not loaded
    // but will call the callback when it is loaded
    getTemplate(url, callback) {
        const templateFromCache = this.templateCache[url];
        if (templateFromCache) {
            return templateFromCache;
        }
        let callbackList = this.waitingCallbacks[url];
        const that = this;
        if (!callbackList) {
            // first time this was called, so need a new list for callbacks
            callbackList = [];
            this.waitingCallbacks[url] = callbackList;
            // and also need to do the http request
            const client = new XMLHttpRequest();
            client.onload = function () {
                that.handleHttpResult(this, url);
            };
            client.open("GET", url);
            client.send();
        }
        // add this callback
        if (callback) {
            callbackList.push(callback);
        }
        // caller needs to wait for template to load, so return null
        return null;
    }
    handleHttpResult(httpResult, url) {
        if (httpResult.status !== 200 || httpResult.response === null) {
            console.warn(`AG Grid: Unable to get template error ${httpResult.status} - ${url}`);
            return;
        }
        // response success, so process it
        // in IE9 the response is in - responseText
        this.templateCache[url] = httpResult.response || httpResult.responseText;
        // inform all listeners that this is now in the cache
        const callbacks = this.waitingCallbacks[url];
        for (let i = 0; i < callbacks.length; i++) {
            const callback = callbacks[i];
            // we could pass the callback the response, however we know the client of this code
            // is the cell renderer, and it passes the 'cellRefresh' method in as the callback
            // which doesn't take any parameters.
            callback();
        }
    }
};
TemplateService = __decorate([
    Bean('templateService')
], TemplateService);
export { TemplateService };

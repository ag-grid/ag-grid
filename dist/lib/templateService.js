/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var TemplateService = (function () {
    function TemplateService() {
        this.templateCache = {};
        this.waitingCallbacks = {};
    }
    TemplateService.prototype.init = function ($scope) {
        this.$scope = $scope;
    };
    // returns the template if it is loaded, or null if it is not loaded
    // but will call the callback when it is loaded
    TemplateService.prototype.getTemplate = function (url, callback) {
        var templateFromCache = this.templateCache[url];
        if (templateFromCache) {
            return templateFromCache;
        }
        var callbackList = this.waitingCallbacks[url];
        var that = this;
        if (!callbackList) {
            // first time this was called, so need a new list for callbacks
            callbackList = [];
            this.waitingCallbacks[url] = callbackList;
            // and also need to do the http request
            var client = new XMLHttpRequest();
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
    };
    TemplateService.prototype.handleHttpResult = function (httpResult, url) {
        if (httpResult.status !== 200 || httpResult.response === null) {
            console.warn('Unable to get template error ' + httpResult.status + ' - ' + url);
            return;
        }
        // response success, so process it
        // in IE9 the response is in - responseText
        this.templateCache[url] = httpResult.response || httpResult.responseText;
        // inform all listeners that this is now in the cache
        var callbacks = this.waitingCallbacks[url];
        for (var i = 0; i < callbacks.length; i++) {
            var callback = callbacks[i];
            // we could pass the callback the response, however we know the client of this code
            // is the cell renderer, and it passes the 'cellRefresh' method in as the callback
            // which doesn't take any parameters.
            callback();
        }
        if (this.$scope) {
            var that = this;
            setTimeout(function () {
                that.$scope.$apply();
            }, 0);
        }
    };
    return TemplateService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TemplateService;

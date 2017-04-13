/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function simpleHttpRequest(params) {
    var promise = new Promise();
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', params.url);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResponse = JSON.parse(httpRequest.responseText);
            promise.resolve(httpResponse);
        }
    };
    return promise;
}
exports.simpleHttpRequest = simpleHttpRequest;
var Promise = (function () {
    function Promise() {
    }
    Promise.prototype.then = function (func) {
        this.thenFunc = func;
    };
    Promise.prototype.resolve = function (result) {
        if (this.thenFunc) {
            this.thenFunc(result);
        }
    };
    return Promise;
}());
exports.Promise = Promise;

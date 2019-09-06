/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
function simpleHttpRequest(params) {
    return new utils_1.Promise(function (resolve) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                var httpResponse = JSON.parse(httpRequest.responseText);
                resolve(httpResponse);
            }
        };
    });
}
exports.simpleHttpRequest = simpleHttpRequest;

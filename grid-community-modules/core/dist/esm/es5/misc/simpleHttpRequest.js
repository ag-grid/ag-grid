/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { AgPromise } from "../utils";
import { doOnce } from "../utils/function";
/**
 * @deprecated Since v29 simpleHttpRequest has been deprecated as it was only meant for use in internal AG Grid documentation examples. Please use the browser fetch api directly.
 */
export function simpleHttpRequest(params) {
    doOnce(function () { return console.warn("AG Grid: Since v29 simpleHttpRequest has been deprecated as it was only meant for use in internal AG Grid documentation examples. Please use the browser fetch api directly."); }, 'simpleHttpRequest');
    return new AgPromise(function (resolve) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                resolve(JSON.parse(httpRequest.responseText));
            }
        };
    });
}

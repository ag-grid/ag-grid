import { AgPromise } from "../utils/index.mjs";
import { doOnce } from "../utils/function.mjs";
/**
 * @deprecated Since v29 simpleHttpRequest has been deprecated as it was only meant for use in internal AG Grid documentation examples. Please use the browser fetch api directly.
 */
export function simpleHttpRequest(params) {
    doOnce(() => console.warn(`AG Grid: Since v29 simpleHttpRequest has been deprecated as it was only meant for use in internal AG Grid documentation examples. Please use the browser fetch api directly.`), 'simpleHttpRequest');
    return new AgPromise(resolve => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                resolve(JSON.parse(httpRequest.responseText));
            }
        };
    });
}

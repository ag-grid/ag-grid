import { AgPromise } from "../utils";

export interface SimpleHttpRequestParams {
    url: string;
}

/* deprecated */
export function simpleHttpRequest(params: SimpleHttpRequestParams): AgPromise<any> {
    return new AgPromise<any>(resolve => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                resolve(JSON.parse(httpRequest.responseText));
            }
        };
    });
}

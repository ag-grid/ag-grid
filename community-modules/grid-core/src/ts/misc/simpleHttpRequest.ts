import { Promise } from "../utils";

export interface SimpleHttpRequestParams {
    url: string;
}

export function simpleHttpRequest(params: SimpleHttpRequestParams): Promise<any> {
    return new Promise<any>(resolve => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                const httpResponse = JSON.parse(httpRequest.responseText);
                resolve(httpResponse);
            }
        };

    });

}

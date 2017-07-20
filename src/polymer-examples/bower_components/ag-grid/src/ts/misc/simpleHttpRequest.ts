
export interface SimpleHttpRequestParams {
    url: string;
}

export function simpleHttpRequest(params: SimpleHttpRequestParams): Promise {

    let promise = new Promise();
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', params.url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            let httpResponse = JSON.parse(httpRequest.responseText);
            promise.resolve(httpResponse);
        }
    };

    return promise;
}

export class Promise {

    private thenFunc: (result: any)=>void;

    public then(func: (result: any)=>void) {
        this.thenFunc = func;
    }

    public resolve(result: any): void {
        if (this.thenFunc) {
            this.thenFunc(result);
        }
    }
}
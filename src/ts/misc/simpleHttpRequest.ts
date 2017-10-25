
export interface SimpleHttpRequestParams {
    url: string;
}

export function simpleHttpRequest(params: SimpleHttpRequestParams): Promise<any> {
    return new Promise<any>( resolve => {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', params.url);
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                let httpResponse = JSON.parse(httpRequest.responseText);
                resolve(httpResponse);
            }
        };

    });

}

export type ResolveAndRejectCallback<T> = (resolve:(value:T)=>void, reject:(params:any)=>void)=>void;

export class Promise<T> {

    private listOfWaiters: ((value:T)=>void)[] = [];

    constructor (
        callback:ResolveAndRejectCallback<T>
    ){
        callback(this.onDone.bind(this), this.onReject.bind(this))
    }

    public then(func: (result: any)=>void) {
        this.listOfWaiters.push(func);
    }

    private onDone (value:T):void {
        this.listOfWaiters.forEach(waiter=>waiter(value));
    }

    private onReject (params:any):void {
        console.warn('TBI');
    }
}
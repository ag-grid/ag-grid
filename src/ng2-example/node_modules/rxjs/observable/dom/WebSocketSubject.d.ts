import { AnonymousSubject } from '../../Subject';
import { Subscriber } from '../../Subscriber';
import { Observable } from '../../Observable';
import { Subscription } from '../../Subscription';
import { Operator } from '../../Operator';
import { Observer, NextObserver } from '../../Observer';
export interface WebSocketSubjectConfig {
    url: string;
    protocol?: string | Array<string>;
    resultSelector?: <T>(e: MessageEvent) => T;
    openObserver?: NextObserver<Event>;
    closeObserver?: NextObserver<CloseEvent>;
    closingObserver?: NextObserver<void>;
    WebSocketCtor?: {
        new (url: string, protocol?: string | Array<string>): WebSocket;
    };
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export declare class WebSocketSubject<T> extends AnonymousSubject<T> {
    url: string;
    protocol: string | Array<string>;
    socket: WebSocket;
    openObserver: NextObserver<Event>;
    closeObserver: NextObserver<CloseEvent>;
    closingObserver: NextObserver<void>;
    WebSocketCtor: {
        new (url: string, protocol?: string | Array<string>): WebSocket;
    };
    private _output;
    resultSelector(e: MessageEvent): any;
    /**
     * @param urlConfigOrSource
     * @return {WebSocketSubject}
     * @static true
     * @name webSocket
     * @owner Observable
     */
    static create<T>(urlConfigOrSource: string | WebSocketSubjectConfig): WebSocketSubject<T>;
    constructor(urlConfigOrSource: string | WebSocketSubjectConfig | Observable<T>, destination?: Observer<T>);
    lift<R>(operator: Operator<T, R>): WebSocketSubject<R>;
    multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean): Observable<{}>;
    private _connectSocket();
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    unsubscribe(): void;
}

import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class MulticastObservable<T> extends Observable<T> {
    protected source: Observable<T>;
    private subjectFactory;
    private selector;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>, selector: (source: Observable<T>) => Observable<T>);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
}

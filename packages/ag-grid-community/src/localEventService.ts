import type { AgEvent, AgGridEvent } from './events';
import type { IEventEmitter, IEventListener, IGlobalEventListener } from './interfaces/iEventEmitter';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';

export class LocalEventService<TEventType extends string> implements IEventEmitter<TEventType> {
    private allSyncListeners = new Map<TEventType, Set<IEventListener<TEventType>>>();
    private allAsyncListeners = new Map<TEventType, Set<IEventListener<TEventType>>>();

    private globalSyncListeners = new Set<IGlobalEventListener<TEventType>>();
    private globalAsyncListeners = new Set<IGlobalEventListener<TEventType>>();

    private frameworkOverrides?: IFrameworkOverrides;

    private asyncFunctionsQueue: (() => void)[] = [];
    private scheduled = false;

    // using an object performs better than a Set for the number of different events we have
    private firedEvents: { [key in TEventType]?: boolean } = {};

    public setFrameworkOverrides(frameworkOverrides: IFrameworkOverrides): void {
        this.frameworkOverrides = frameworkOverrides;
    }

    private getListeners(
        eventType: TEventType,
        async: boolean,
        autoCreateListenerCollection: boolean
    ): Set<IEventListener<TEventType>> | undefined {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        let listeners = listenerMap.get(eventType);

        // Note: 'autoCreateListenerCollection' should only be 'true' if a listener is about to be added. For instance
        // getListeners() is also called during event dispatch even though no listeners are added. This measure protects
        // against 'memory bloat' as empty collections will prevent the RowNode's event service from being removed after
        // the RowComp is destroyed, see noRegisteredListenersExist() below.
        if (!listeners && autoCreateListenerCollection) {
            listeners = new Set<IEventListener<TEventType>>();
            listenerMap.set(eventType, listeners);
        }

        return listeners;
    }

    public noRegisteredListenersExist(): boolean {
        return (
            this.allSyncListeners.size === 0 &&
            this.allAsyncListeners.size === 0 &&
            this.globalSyncListeners.size === 0 &&
            this.globalAsyncListeners.size === 0
        );
    }

    public addEventListener<T extends TEventType>(eventType: T, listener: IEventListener<T>, async = false): void {
        this.getListeners(eventType, async, true)!.add(listener);
    }

    public removeEventListener<T extends TEventType>(eventType: T, listener: IEventListener<T>, async = false): void {
        const listeners = this.getListeners(eventType, async, false);
        if (!listeners) {
            return;
        }

        listeners.delete(listener);

        if (listeners.size === 0) {
            const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
            listenerMap.delete(eventType);
        }
    }

    public addGlobalListener(listener: IGlobalEventListener<TEventType>, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).add(listener);
    }

    public removeGlobalListener(listener: IGlobalEventListener<TEventType>, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).delete(listener);
    }

    public dispatchEvent(event: AgEvent<TEventType>): void {
        const agEvent = event as AgGridEvent<any, any, TEventType>;

        this.dispatchToListeners(agEvent, true);
        this.dispatchToListeners(agEvent, false);

        this.firedEvents[agEvent.type] = true;
    }

    public dispatchEventOnce(event: AgEvent<TEventType>): void {
        if (!this.firedEvents[event.type]) {
            this.dispatchEvent(event);
        }
    }

    private dispatchToListeners(event: AgGridEvent<any, any, TEventType>, async: boolean) {
        const eventType = event.type;

        if (async && 'event' in event) {
            const browserEvent = (event as any).event;
            if (browserEvent instanceof Event) {
                // AG-7893 - Persist composedPath() so that its result can still be accessed by the user asynchronously.
                // Within an async event handler if they call composedPath() on the event it will always return an empty [].
                (event as any).eventPath = browserEvent.composedPath();
            }
        }

        const processEventListeners = (
            listeners: Set<IEventListener<TEventType>>,
            originalListeners: Set<IEventListener<TEventType>>
        ) =>
            listeners.forEach((listener) => {
                if (!originalListeners.has(listener)) {
                    // A listener could have been removed by a previously processed listener. In this case we don't want to call
                    return;
                }
                const callback = this.frameworkOverrides
                    ? () => this.frameworkOverrides!.wrapIncoming(() => listener(event))
                    : () => listener(event);

                if (async) {
                    this.dispatchAsync(callback);
                } else {
                    callback();
                }
            });

        const originalListeners = this.getListeners(eventType, async, false) ?? new Set<IEventListener<TEventType>>();
        // create a shallow copy to prevent listeners cyclically adding more listeners to capture this event
        const listeners = new Set<IEventListener<TEventType>>(originalListeners);
        if (listeners.size > 0) {
            processEventListeners(listeners, originalListeners);
        }

        const globalListeners: Set<IGlobalEventListener<TEventType>> = new Set(
            async ? this.globalAsyncListeners : this.globalSyncListeners
        );

        globalListeners.forEach((listener) => {
            const callback = this.frameworkOverrides
                ? () => this.frameworkOverrides!.wrapIncoming(() => listener(eventType, event))
                : () => listener(eventType, event);

            if (async) {
                this.dispatchAsync(callback);
            } else {
                callback();
            }
        });
    }

    // this gets called inside the grid's thread, for each event that it
    // wants to set async. the grid then batches the events into one setTimeout()
    // because setTimeout() is an expensive operation. ideally we would have
    // each event in it's own setTimeout(), but we batch for performance.
    private dispatchAsync(func: () => void): void {
        // add to the queue for executing later in the next VM turn
        this.asyncFunctionsQueue.push(func);

        // check if timeout is already scheduled. the first time the grid calls
        // this within it's thread turn, this should be false, so it will schedule
        // the 'flush queue' method the first time it comes here. then the flag is
        // set to 'true' so it will know it's already scheduled for subsequent calls.
        if (!this.scheduled) {
            // if not scheduled, schedule one
            const flush = () => {
                window.setTimeout(this.flushAsyncQueue.bind(this), 0);
            };
            this.frameworkOverrides ? this.frameworkOverrides.wrapIncoming(flush) : flush();
            // mark that it is scheduled
            this.scheduled = true;
        }
    }

    // this happens in the next VM turn only, and empties the queue of events
    private flushAsyncQueue(): void {
        this.scheduled = false;

        // we take a copy, because the event listener could be using
        // the grid, which would cause more events, which would be potentially
        // added to the queue, so safe to take a copy, the new events will
        // get executed in a later VM turn rather than risk updating the
        // queue as we are flushing it.
        const queueCopy = this.asyncFunctionsQueue.slice();
        this.asyncFunctionsQueue = [];

        // execute the queue
        queueCopy.forEach((func) => func());
    }
}

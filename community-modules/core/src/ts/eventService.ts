import { Logger } from "./logger";
import { LoggerFactory } from "./logger";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { AgEvent } from "./events";

@Bean('eventService')
export class EventService implements IEventEmitter {

    private allSyncListeners = new Map<string, Set<Function>>();
    private allAsyncListeners = new Map<string, Set<Function>>();

    private globalSyncListeners = new Set<Function>();
    private globalAsyncListeners = new Set<Function>();

    private logger: Logger;

    private asyncFunctionsQueue: Function[] = [];
    private scheduled = false;

    // this is an old idea niall had, should really take it out, was to do with ordering who gets to process
    // events first, to give model and service objects preference over the view
    private static PRIORITY = '-P1';

    // using an object performs better than a Set for the number of different events we have
    private firedEvents: { [key: string]: boolean; } = {};

    // because this class is used both inside the context and outside the context, we do not
    // use autowired attributes, as that would be confusing, as sometimes the attributes
    // would be wired, and sometimes not.
    //
    // the global event servers used by ag-Grid is autowired by the context once, and this
    // setBeans method gets called once.
    //
    // the times when this class is used outside of the context (eg RowNode has an instance of this
    // class) then it is not a bean, and this setBeans method is not called.
    public setBeans(
        @Qualifier('loggerFactory') loggerFactory: LoggerFactory,
        @Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper,
        @Qualifier('globalEventListener') globalEventListener: Function = null) {
        this.logger = loggerFactory.create('EventService');

        if (globalEventListener) {
            const async = gridOptionsWrapper.useAsyncEvents();
            this.addGlobalListener(globalEventListener, async);
        }
    }

    private getListeners(eventType: string, async: boolean): Set<Function> {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        let listeners = listenerMap.get(eventType);

        if (!listeners) {
            listeners = new Set<Function>();
            listenerMap.set(eventType, listeners);
        }

        return listeners;
    }

    public addEventListener(eventType: string, listener: Function, async = false): () => void {
        this.getListeners(eventType, async).add(listener);

        return () => this.removeEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async = false): void {
        this.getListeners(eventType, async).delete(listener);
    }

    // for some events, it's important that the model gets to hear about them before the view,
    // as the model may need to update before the view works on the info. if you register
    // via this method, you get notified before the view parts
    public addModalPriorityEventListener(eventType: string, listener: Function, async = false): () => void {
        return this.addEventListener(eventType + EventService.PRIORITY, listener, async);
    }

    public addGlobalListener(listener: Function, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).add(listener);
    }

    public removeGlobalListener(listener: Function, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).delete(listener);
    }

    public dispatchEvent(event: AgEvent): void {
        this.dispatchToListeners(event, true);
        this.dispatchToListeners(event, false);

        this.firedEvents[event.type] = true;
    }

    public dispatchEventOnce(event: AgEvent): void {
        if (!this.firedEvents[event.type]) {
            this.dispatchEvent(event);
        }
    }

    private dispatchToListeners(event: AgEvent, async: boolean) {
        const eventType = event.type;
        const processEventListeners = (listeners: Set<Function>) => listeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => listener(event));
            } else {
                listener(event);
            }
        });

        // PRIORITY events should be processed first
        processEventListeners(this.getListeners(eventType + EventService.PRIORITY, async));
        processEventListeners(this.getListeners(eventType, async));

        const globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;

        globalListeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => listener(eventType, event));
            } else {
                listener(eventType, event);
            }
        });
    }

    // this gets called inside the grid's thread, for each event that it
    // wants to set async. the grid then batches the events into one setTimeout()
    // because setTimeout() is an expensive operation. ideally we would have
    // each event in it's own setTimeout(), but we batch for performance.
    private dispatchAsync(func: Function): void {
        // add to the queue for executing later in the next VM turn
        this.asyncFunctionsQueue.push(func);

        // check if timeout is already scheduled. the first time the grid calls
        // this within it's thread turn, this should be false, so it will schedule
        // the 'flush queue' method the first time it comes here. then the flag is
        // set to 'true' so it will know it's already scheduled for subsequent calls.
        if (!this.scheduled) {
            // if not scheduled, schedule one
            window.setTimeout(this.flushAsyncQueue.bind(this), 0);
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
        queueCopy.forEach(func => func());
    }
}

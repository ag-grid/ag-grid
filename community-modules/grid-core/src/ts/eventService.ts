import { Logger } from "./logger";
import { LoggerFactory } from "./logger";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { AgEvent } from "./events";
import { _ } from './utils';

@Bean('eventService')
export class EventService implements IEventEmitter {

    private allSyncListeners: {[key: string]: Function[]} = {};
    private allAsyncListeners: {[key: string]: Function[]} = {};

    private globalSyncListeners: Function[] = [];
    private globalAsyncListeners: Function[] = [];

    private logger: Logger;

    private asyncFunctionsQueue: Function[] = [];
    private scheduled = false;

    // this is an old idea niall had, should really take it out, was to do with ordering who gets to process
    // events first, to give model and service objects preference over the view
    private static PRIORITY = '-P1';

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
    public setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory,
                    @Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper,
                   @Qualifier('globalEventListener') globalEventListener: Function = null) {
        this.logger = loggerFactory.create('EventService');

        if (globalEventListener) {
            const async = gridOptionsWrapper.useAsyncEvents();
            this.addGlobalListener(globalEventListener, async);
        }
    }

    private getListenerList(eventType: string, async: boolean): Function[] {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        let listenerList = listenerMap[eventType];
        if (!listenerList) {
            listenerList = [];
            listenerMap[eventType] = listenerList;
        }
        return listenerList;
    }

    public addEventListener(eventType: string, listener: Function, async = false): void {
        const listenerList = this.getListenerList(eventType, async);
        if (listenerList.indexOf(listener) < 0) {
            listenerList.push(listener);
        }
    }

    // for some events, it's important that the model gets to hear about them before the view,
    // as the model may need to update before the view works on the info. if you register
    // via this method, you get notified before the view parts
    public addModalPriorityEventListener(eventType: string, listener: Function, async = false): void {
        this.addEventListener(eventType + EventService.PRIORITY, listener, async);
    }

    public addGlobalListener(listener: Function, async = false): void {
        if (async) {
            this.globalAsyncListeners.push(listener);
        } else {
            this.globalSyncListeners.push(listener);
        }
    }

    public removeEventListener(eventType: string, listener: Function, async = false): void {
        const listenerList = this.getListenerList(eventType, async);
        _.removeFromArray(listenerList, listener);
    }

    public removeGlobalListener(listener: Function, async = false): void {
        if (async) {
            _.removeFromArray(this.globalAsyncListeners, listener);
        } else {
            _.removeFromArray(this.globalSyncListeners, listener);
        }
    }

    // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
    // type is not in other types of events???
    public dispatchEvent(event: AgEvent): void {
        // console.log(`dispatching ${eventType}: ${event}`);
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

        const globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;
        const eventType = event.type;

        // this allows the columnController to get events before anyone else
        const p1ListenerList = this.getListenerList(eventType + EventService.PRIORITY, async);
        _.forEachSnapshotFirst(p1ListenerList, listener => {
            if (async) {
                this.dispatchAsync(() => listener(event));
            } else {
                listener(event);
            }
        });

        const listenerList = this.getListenerList(eventType, async);
        _.forEachSnapshotFirst(listenerList, listener => {
            if (async) {
                this.dispatchAsync(() => listener(event));
            } else {
                listener(event);
            }
        });

        _.forEachSnapshotFirst(globalListeners, listener => {
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

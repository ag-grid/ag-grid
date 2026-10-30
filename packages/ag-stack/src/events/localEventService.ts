import type { AgEvent } from '../interfaces/agEvent';
import type { AgFrameworkOverrides, AgListenerWrapper } from '../interfaces/agFrameworkOverrides';
import type { IEventEmitter, IEventListener, IGlobalEventListener } from '../interfaces/iEventEmitter';

/** A global listener, the only event types it receives (`null` for every type) and those it never receives. */
interface GlobalListenerEntry<TEventType extends string> {
    readonly listener: IGlobalEventListener<TEventType>;
    readonly eventTypes: ReadonlySet<TEventType> | null;
    readonly exceptEventTypes: ReadonlySet<TEventType> | null;
}

/** One listener as itself, more as a `Set`. */
type TypeListeners<TEventType extends string> = IEventListener<TEventType> | Set<IEventListener<TEventType>>;

/** A type listener, or the entry of a global one, then its event: pairs written only by `queueListener`. */
type AsyncQueue<TEventType extends string> = (
    IEventListener<TEventType> | GlobalListenerEntry<TEventType> | AgEvent<TEventType>
)[];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class LocalEventService<TEventType extends string> implements IEventEmitter<TEventType> {
    private readonly allSyncListeners = new Map<TEventType, TypeListeners<TEventType>>();
    // Created on first use: grid code adds async and global listeners only on its own service.
    private allAsyncListeners: Map<TEventType, TypeListeners<TEventType>> | null = null;
    // Replaced on change, never mutated, so a running dispatch keeps the global listeners it started with.
    private globalSyncListeners: readonly GlobalListenerEntry<TEventType>[] | null = null;
    private globalAsyncListeners: readonly GlobalListenerEntry<TEventType>[] | null = null;

    private frameworkOverrides: AgFrameworkOverrides | undefined = undefined;

    private asyncQueue: AsyncQueue<TEventType> | null = null;
    private scheduled = false;

    /** Set by a framework that may wrap user listeners: maps each user listener to the one registered for it. */
    public listenerWrapper: AgListenerWrapper | undefined = undefined;

    public setFrameworkOverrides(frameworkOverrides: AgFrameworkOverrides): void {
        this.frameworkOverrides = frameworkOverrides;
    }

    public noRegisteredListenersExist(): boolean {
        return (
            this.allSyncListeners.size === 0 &&
            !this.allAsyncListeners?.size &&
            this.globalSyncListeners === null &&
            this.globalAsyncListeners === null
        );
    }

    /** Whether dispatching `eventType` would reach a listener, so a caller can skip building the event. Any global
     *  listener counts, even one limited to other types: on the grid's service (it always has one) this is `true`. */
    public hasListeners(eventType: TEventType): boolean {
        return (
            this.allSyncListeners.has(eventType) ||
            !!this.allAsyncListeners?.has(eventType) ||
            this.globalSyncListeners !== null ||
            this.globalAsyncListeners !== null
        );
    }

    public addEventListener<T extends TEventType>(eventType: T, listener: IEventListener<T>, async = false): void {
        let listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        if (listenerMap === null) {
            listenerMap = new Map();
            this.allAsyncListeners = listenerMap;
        }
        const listeners = listenerMap.get(eventType);
        if (listeners === undefined) {
            listenerMap.set(eventType, listener);
        } else if (typeof listeners !== 'function') {
            listeners.add(listener);
        } else if (listeners !== listener) {
            const created = new Set<IEventListener<TEventType>>();
            created.add(listeners);
            created.add(listener);
            listenerMap.set(eventType, created);
        }
    }

    public removeEventListener<T extends TEventType>(eventType: T, listener: IEventListener<T>, async = false): void {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        if (listenerMap === null) {
            return;
        }
        const listeners = listenerMap.get(eventType);
        if (
            listeners === listener ||
            (typeof listeners === 'object' && listeners.delete(listener) && listeners.size === 0)
        ) {
            listenerMap.delete(eventType);
        }
    }

    /** Receives only `eventTypes` (every type when absent) but `exceptEventTypes`; each add registers it again. */
    public addGlobalListener(
        listener: IGlobalEventListener<TEventType>,
        async = false,
        eventTypes?: ReadonlySet<TEventType>,
        exceptEventTypes?: ReadonlySet<TEventType>
    ): void {
        const entry: GlobalListenerEntry<TEventType> = {
            listener,
            eventTypes: eventTypes ?? null,
            exceptEventTypes: exceptEventTypes ?? null,
        };
        if (async) {
            this.globalAsyncListeners = withGlobalListener(this.globalAsyncListeners, entry);
        } else {
            this.globalSyncListeners = withGlobalListener(this.globalSyncListeners, entry);
        }
    }

    public removeGlobalListener(listener: IGlobalEventListener<TEventType>, async = false): void {
        if (async) {
            this.globalAsyncListeners = withoutGlobalListener(this.globalAsyncListeners, listener);
        } else {
            this.globalSyncListeners = withoutGlobalListener(this.globalSyncListeners, listener);
        }
    }

    public dispatchEvent<TEvent extends AgEvent<TEventType>>(event: TEvent): void {
        const eventType = event.type;
        if ('event' in event) {
            const browserEvent = (event as any).event;
            if (browserEvent instanceof Event) {
                // AG-7893 - Persist composedPath() so that its result can still be accessed by the user asynchronously.
                // Within an async event handler if they call composedPath() on the event it will always return an empty [].
                (event as any).eventPath = browserEvent.composedPath();
            }
        }

        // async listeners are only queued here, so none can be added or removed before the last one is queued
        const asyncListeners = this.allAsyncListeners?.get(eventType);
        if (typeof asyncListeners === 'function') {
            this.queueListener(asyncListeners, event);
        } else if (asyncListeners !== undefined) {
            for (const listener of asyncListeners) {
                this.queueListener(listener, event);
            }
        }
        const globalAsyncListeners = this.globalAsyncListeners;
        if (globalAsyncListeners !== null) {
            for (let i = 0, len = globalAsyncListeners.length; i < len; ++i) {
                const entry = globalAsyncListeners[i];
                if (receivesEventType(entry, eventType)) {
                    this.queueListener(entry, event);
                } else {
                    // as if queued, so the flush keeps its place among timers set later in this turn
                    this.scheduleFlush();
                }
            }
        }

        const listeners = this.allSyncListeners.get(eventType);
        if (listeners === undefined && this.globalSyncListeners === null) {
            return;
        }
        const frameworkOverrides = this.frameworkOverrides;
        if (frameworkOverrides) {
            frameworkOverrides.wrapIncoming(() => this.callListeners(event, listeners));
        } else {
            this.callListeners(event, listeners);
        }
    }

    private callListeners(event: AgEvent<TEventType>, listeners: TypeListeners<TEventType> | undefined): void {
        if (typeof listeners === 'function') {
            listeners(event);
        } else if (listeners !== undefined) {
            // a listener added by this dispatch is not in the snapshot, so it waits for the next one
            const snapshot = Array.from(listeners);
            for (let i = 0, len = snapshot.length; i < len; ++i) {
                const listener = snapshot[i];
                if (listeners.has(listener)) {
                    listener(event); // else removed by a listener called before it
                }
            }
        }
        // read after the type listeners, which may add or remove global ones
        const globalListeners = this.globalSyncListeners;
        if (globalListeners !== null) {
            const eventType = event.type;
            for (let i = 0, len = globalListeners.length; i < len; ++i) {
                const entry = globalListeners[i];
                if (receivesEventType(entry, eventType)) {
                    entry.listener(eventType, event);
                }
            }
        }
    }

    // batched into one setTimeout per VM turn, as setTimeout is expensive
    private queueListener(
        listener: IEventListener<TEventType> | GlobalListenerEntry<TEventType>,
        event: AgEvent<TEventType>
    ): void {
        const queue = this.asyncQueue;
        if (queue === null) {
            this.asyncQueue = [listener, event];
        } else {
            queue.push(listener, event);
        }
        this.scheduleFlush();
    }

    // the first call within a VM turn schedules the 'flush queue' method, later ones find it already scheduled
    private scheduleFlush(): void {
        if (this.scheduled) {
            return;
        }
        const flush = this.flushAsyncQueue.bind(this);
        const frameworkOverrides = this.frameworkOverrides;
        if (frameworkOverrides) {
            frameworkOverrides.wrapIncoming(() => window.setTimeout(flush, 0));
        } else {
            window.setTimeout(flush, 0);
        }
        this.scheduled = true;
    }

    // this happens in the next VM turn only, and empties the queue of events
    private flushAsyncQueue(): void {
        this.scheduled = false;

        // events dispatched by these listeners queue into a new batch, run in a later VM turn
        const queue = this.asyncQueue;
        this.asyncQueue = null;
        if (queue === null) {
            return;
        }
        const frameworkOverrides = this.frameworkOverrides;
        if (frameworkOverrides) {
            frameworkOverrides.wrapIncoming(() => callQueuedListeners(queue));
        } else {
            callQueuedListeners(queue);
        }
    }
}

function callQueuedListeners<TEventType extends string>(queue: AsyncQueue<TEventType>): void {
    for (let i = 0, len = queue.length; i < len; i += 2) {
        const listener = queue[i] as IEventListener<TEventType> | GlobalListenerEntry<TEventType>;
        const event = queue[i + 1] as AgEvent<TEventType>;
        if (typeof listener === 'function') {
            listener(event);
        } else {
            listener.listener(event.type, event);
        }
    }
}

function receivesEventType<TEventType extends string>(
    entry: GlobalListenerEntry<TEventType>,
    eventType: TEventType
): boolean {
    return (entry.eventTypes?.has(eventType) ?? true) && !entry.exceptEventTypes?.has(eventType);
}

// global listeners change only when a grid, framework or application starts or stops listening
function withGlobalListener<TEventType extends string>(
    globalListeners: readonly GlobalListenerEntry<TEventType>[] | null,
    entry: GlobalListenerEntry<TEventType>
): readonly GlobalListenerEntry<TEventType>[] {
    return globalListeners === null ? [entry] : [...globalListeners, entry];
}

function withoutGlobalListener<TEventType extends string>(
    globalListeners: readonly GlobalListenerEntry<TEventType>[] | null,
    listener: IGlobalEventListener<TEventType>
): readonly GlobalListenerEntry<TEventType>[] | null {
    if (globalListeners === null) {
        return null;
    }
    const index = findGlobalListener(globalListeners, listener);
    if (index === -1) {
        return globalListeners;
    }
    if (globalListeners.length === 1) {
        return null;
    }
    const updated = globalListeners.slice();
    updated.splice(index, 1);
    return updated;
}

function findGlobalListener<TEventType extends string>(
    globalListeners: readonly GlobalListenerEntry<TEventType>[],
    listener: IGlobalEventListener<TEventType>
): number {
    const len = globalListeners.length;
    let index = 0;
    while (index < len && globalListeners[index].listener !== listener) {
        ++index;
    }
    return index === len ? -1 : index;
}

import { LocalEventService } from '../events/localEventService';
import type { AgBaseBean } from '../interfaces/agBaseBean';
import type { AgBean } from '../interfaces/agBean';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { AgEvent } from '../interfaces/agEvent';
import type { AgEventHandlers, IContext } from '../interfaces/iContext';
import type { AgEventService } from '../interfaces/iEvent';
import type {
    AgListenerOptions,
    AgListenerOptionsForEvent,
    IAgEventEmitter,
    IEventEmitter,
    IEventListener,
    ListenerTarget,
} from '../interfaces/iEventEmitter';
import type { LocaleTextFunc } from '../interfaces/iLocaleService';
import type {
    AgPropertyChangedEvent,
    AgPropertyChangedListener,
    AgPropertyValueChangedEvent,
    AgPropertyValueChangedListener,
    IPropertiesService,
} from '../interfaces/iProperties';
import { _removeFromArray } from '../utils/array';
import { _getLocaleTextFunc } from '../utils/locale';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgBeanStubEvent = 'destroyed';
type AgEventOrDestroyed<TEventType extends string> = TEventType | AgBeanStubEvent;

const DESTROYED_EVENT = { type: 'destroyed' as AgBeanStubEvent };

/**
 * The base class for every bean. Needs no DOM, so it also runs in workers and on the server.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export abstract class AgAbstractBean<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TPropertiesService>,
    TProperties,
    TGlobalEvents,
    TPropertiesService extends IPropertiesService<TProperties>,
    TLocalEventType extends string = AgBeanStubEvent,
>
    implements
        AgBean<TBeanCollection, TProperties, TGlobalEvents, TLocalEventType>,
        IEventEmitter<AgEventOrDestroyed<TLocalEventType>>
{
    // Vue 3 reactivity-skip flag — prevents Vue from proxying beans (and avoids identity issues). Lives on the
    // prototype (see below), not per instance: Vue reads it via a normal property access that walks the chain.
    declare public __v_skip: boolean;

    protected beans: TBeanCollection = null!;
    protected gos: TPropertiesService = null!;
    protected eventSvc: TBeanCollection['eventSvc'] = null!;

    /** Indicates whether the bean has been destroyed */
    public destroyed = false;
    protected localEventService: LocalEventService<AgEventOrDestroyed<TLocalEventType>> | null = null;

    // Cold — touched only on bean creation / destruction.
    private destroyFunctions: (() => void)[] | null = null;

    private propertyListenerId = 0;

    // Enable multiple grid properties to be updated together by the user but only trigger shared logic once.
    // Closely related to logic in GridOptionsUtils.ts _processOnChange
    // Lazy — most beans never register grouped property listeners, so the lookup object is allocated on first use.
    private lastChangeSetIdLookup: Record<string, number> | null = null;

    public preWireBeans(beans: TBeanCollection): void {
        this.beans = beans;
        this.gos = beans.gos;
        this.eventSvc = beans.eventSvc;
    }

    public destroy(): void {
        const destroyFunctions = this.destroyFunctions;
        if (destroyFunctions) {
            for (let i = 0; i < destroyFunctions.length; i++) {
                destroyFunctions[i]();
            }
            destroyFunctions.length = 0;
        }
        this.destroyed = true;

        // cast destroy type as we do not want to expose destroy event type to the dispatchLocalEvent method
        // as no one else should be firing destroyed at the bean stub.
        this.dispatchLocalEvent(DESTROYED_EVENT as any);
    }

    /** Add a local event listener against this BeanStub */
    public addEventListener<T extends TLocalEventType>(
        eventType: T,
        listener: IEventListener<T>,
        async?: boolean
    ): void {
        let localEventService = this.localEventService;
        if (!localEventService) {
            localEventService = new LocalEventService();
            this.localEventService = localEventService;
        }
        localEventService.addEventListener(eventType, listener, async);
    }

    /** Remove a local event listener from this BeanStub */
    public removeEventListener<T extends TLocalEventType>(
        eventType: T,
        listener: IEventListener<T>,
        async?: boolean
    ): void {
        this.localEventService?.removeEventListener(eventType, listener, async);
    }

    public dispatchLocalEvent<TEvent extends AgEvent<TLocalEventType>>(event: TEvent): void {
        this.localEventService?.dispatchEvent(event);
    }

    public addManagedEventListeners(handlers: { [K in keyof TGlobalEvents]?: (event: TGlobalEvents[K]) => void }) {
        return this._setupListeners<keyof TGlobalEvents & string>(this.eventSvc, handlers);
    }

    public addManagedListeners<TEvent extends string>(
        object: ListenerTarget | IEventEmitter<TEvent> | IAgEventEmitter<TEvent> | AgEventService<TGlobalEvents>,
        handlers: AgEventHandlers<TEvent>,
        optionsForEvent?: AgListenerOptionsForEvent
    ) {
        return this._setupListeners<TEvent>(object, handlers, optionsForEvent);
    }

    private _setupListeners<TEvent extends string>(
        object: ListenerTarget | IEventEmitter<TEvent> | IAgEventEmitter<TEvent> | AgEventService<TGlobalEvents>,
        handlers: AgEventHandlers<TEvent>,
        optionsForEvent?: AgListenerOptionsForEvent
    ) {
        const destroyFuncs: (() => null)[] = [];
        const keys = Object.keys(handlers);
        for (let i = 0, len = keys.length; i < len; ++i) {
            const k = keys[i];
            const handler = handlers[k as TEvent];
            if (handler) {
                destroyFuncs.push(this._setupListener(object, k, handler, optionsForEvent?.(k)));
            }
        }
        return destroyFuncs;
    }

    private _setupListener<const T extends string>(
        object: ListenerTarget | IEventEmitter<T> | IAgEventEmitter<T> | AgEventService<TGlobalEvents>,
        event: T,
        listener: (event?: any) => void,
        options?: Readonly<AgListenerOptions>
    ): () => null {
        if (this.destroyed) {
            return () => null;
        }

        let destroyFunc: () => null;

        if (isAgEventEmitter(object)) {
            object.__addEventListener(event, listener);
            destroyFunc = () => {
                object.__removeEventListener(event, listener);
                return null;
            };
        } else {
            const objIsEventService = isEventService<TGlobalEvents>(object);
            if (objIsEventService) {
                object.addListener(event as any, listener);
            } else if (options) {
                (object as ListenerTarget).addEventListener(event, listener, options);
            } else {
                (object as ListenerTarget).addEventListener(event, listener);
            }

            destroyFunc = objIsEventService
                ? () => {
                      object.removeListener(event as any, listener);
                      return null;
                  }
                : () => {
                      (object as ListenerTarget).removeEventListener(event, listener);
                      return null;
                  };
        }

        return this.registerDestroyFunc(destroyFunc);
    }

    /**
     * Setup a managed property listener for the given property.
     * However, stores the destroy function in the beanStub so that if this bean
     * is a component the destroy function will be called when the component is destroyed
     * as opposed to being cleaned up only when the properties service is destroyed.
     */
    private setupPropertyListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, K>
    ): () => null {
        const { gos } = this;
        gos.addPropertyEventListener(event, listener);
        const destroyFunc: () => null = () => {
            gos.removePropertyEventListener(event, listener);
            return null;
        };
        return this.registerDestroyFunc(destroyFunc);
    }

    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    public addManagedPropertyListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, K>
    ): () => null {
        if (this.destroyed) {
            return () => null;
        }

        return this.setupPropertyListener(event, listener);
    }

    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    public addManagedPropertyListeners(
        events: (keyof TProperties)[],
        listener: AgPropertyChangedListener<TProperties>
    ): void {
        if (this.destroyed) {
            return;
        }

        // Ensure each set of events can run for the same changeSetId
        const eventsKey = events.join('-') + this.propertyListenerId++;

        const wrappedListener = (event: AgPropertyValueChangedEvent<TProperties, any>) => {
            const changeSet = event.changeSet;
            if (changeSet) {
                // ChangeSet is only set when the property change is part of a group of changes from ComponentUtils
                // Direct api calls should always be run as
                let lookup = this.lastChangeSetIdLookup;
                if (!lookup) {
                    lookup = {};
                    this.lastChangeSetIdLookup = lookup;
                }
                if (changeSet.id === lookup[eventsKey]) {
                    // Already run the listener for this set of prop changes so don't run again
                    return;
                }
                lookup[eventsKey] = changeSet.id;
            }
            // Don't expose the underlying event value changes to the group listener.
            const propertiesChangeEvent: AgPropertyChangedEvent<TProperties> = {
                type: 'propertyChanged',
                changeSet,
                source: event.source,
            };
            listener(propertiesChangeEvent);
        };

        for (let i = 0, len = events.length; i < len; ++i) {
            this.setupPropertyListener(events[i], wrappedListener);
        }
    }

    // Prototype method, not a per-instance arrow — never invoked detached, so binding per bean only wastes memory.
    public isAlive(): boolean {
        return !this.destroyed;
    }

    public getLocaleTextFunc(): LocaleTextFunc {
        return _getLocaleTextFunc(this.beans.localeSvc);
    }

    // Lazy — most beans never register a destroy func, so the array is allocated on first push.
    private pushDestroyFunc(destroyFunc: () => void): void {
        const destroyFunctions = this.destroyFunctions;
        if (destroyFunctions) {
            destroyFunctions.push(destroyFunc);
        } else {
            this.destroyFunctions = [destroyFunc];
        }
    }

    /** Register a destroy func and return an unregister callback that removes it if called before destroy. */
    private registerDestroyFunc(destroyFunc: () => null): () => null {
        this.pushDestroyFunc(destroyFunc);
        return () => {
            destroyFunc();
            // Only remove if manually called before bean is destroyed
            const destroyFunctions = this.destroyFunctions;
            if (destroyFunctions) {
                _removeFromArray(destroyFunctions, destroyFunc);
            }
            return null;
        };
    }

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.destroyed) {
            func();
        } else {
            this.pushDestroyFunc(func);
        }
    }

    /** doesn't throw an error if `bean` is undefined */
    public createOptionalManagedBean<T extends AgBaseBean<TBeanCollection> | null | undefined>(
        bean: T,
        context?: IContext<TBeanCollection>
    ): T | undefined {
        return bean ? this.createManagedBean(bean, context) : undefined;
    }

    public createManagedBean<T extends AgBaseBean<TBeanCollection>>(bean: T, context?: IContext<TBeanCollection>): T {
        const res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    }

    public createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        context?: IContext<TBeanCollection> | null,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T {
        return (context ?? this.beans.context).createBean(bean, afterPreCreateCallback);
    }

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    public destroyBean(
        bean: AgBaseBean<TBeanCollection> | null | undefined,
        context?: IContext<TBeanCollection>
    ): undefined {
        return (context ?? this.beans.context).destroyBean(bean);
    }

    /**
     * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
     * this.dateComps = this.context.destroyBeans(this.dateComps);
     */
    protected destroyBeans<T extends AgBaseBean<TBeanCollection>>(
        beans: (T | null | undefined)[],
        context?: IContext<TBeanCollection>
    ): T[] {
        return (context ?? this.beans.context).destroyBeans(beans);
    }
}

// Single shared value on the prototype — Vue's reactive() reads `__v_skip` through the prototype chain.
AgAbstractBean.prototype.__v_skip = true;

// type guard for IAgEventEmitter
function isAgEventEmitter<TEvent extends string>(object: unknown): object is IAgEventEmitter<TEvent> {
    return (object as IAgEventEmitter<TEvent>).__addEventListener !== undefined;
}

function isEventService<TGlobalEvents>(object: unknown): object is AgEventService<TGlobalEvents> {
    return (object as AgEventService<TGlobalEvents>).eventServiceType === 'global';
}

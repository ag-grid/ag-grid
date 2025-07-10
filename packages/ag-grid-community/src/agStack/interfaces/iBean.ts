import type { AgEvent } from './agEvent';
import type { AgBaseContext, AgEventHandlers } from './iContext';
import type { IAgEventEmitter, IEventEmitter, IEventListener } from './iEventEmitter';
import type { LocaleTextFunc } from './iLocaleService';
import type {
    AgPropertyChangedListener,
    AgPropertyValueChangedListener,
    BaseProperties,
    BasePropertyDefaults,
} from './iProperties';

export interface AgBaseBean<TBeanCollection> {
    /** AG Grid internal - do not call */
    preWireBeans?(beans: TBeanCollection): void;

    /** AG Grid internal - do not call */
    wireBeans?(beans: TBeanCollection): void;

    /** AG Grid internal - do not call */
    preConstruct?(): void;

    /** AG Grid internal - do not call */
    postConstruct?(): void;

    /** AG Grid internal - do not call */
    destroy?(): void;
}

export interface AgSingletonBean<TBeanCollection> extends AgBaseBean<TBeanCollection> {
    /** AG Grid internal - do not use */
    beanName?: keyof TBeanCollection & string;
}

export interface AgBean<
    TBeanCollection,
    TLocalEventListener extends IEventListener<TLocalEventType>,
    TLocalEventType extends string,
    TGlobalEvents,
    TProperties extends BaseProperties,
    TPropertyDefaults extends BasePropertyDefaults,
> extends AgBaseBean<TBeanCollection> {
    addEventListener<T extends TLocalEventType>(eventType: T, listener: TLocalEventListener, async?: boolean): void;

    removeEventListener<T extends TLocalEventType>(eventType: T, listener: TLocalEventListener, async?: boolean): void;

    dispatchLocalEvent<TEvent extends AgEvent<TLocalEventType>>(event: TEvent): void;

    addManagedElementListeners<TEvent extends keyof HTMLElementEventMap>(
        object: Element | Document | ShadowRoot,
        handlers: AgEventHandlers<TEvent, HTMLElementEventMap[TEvent]>
    ): (() => null)[];

    addManagedEventListeners(handlers: {
        [K in keyof TGlobalEvents]?: (event: TGlobalEvents[K]) => void;
    }): (() => null)[];

    addManagedListeners<TEvent extends string>(
        object: IEventEmitter<TEvent> | IAgEventEmitter<TEvent>,
        handlers: AgEventHandlers<TEvent>
    ): (() => null)[];

    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    addManagedPropertyListener<K extends keyof TProperties & string>(
        event: K,
        listener: AgPropertyValueChangedListener<TProperties, TPropertyDefaults, K>
    ): () => null;

    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    addManagedPropertyListeners(events: (keyof TProperties)[], listener: AgPropertyChangedListener<TProperties>): void;

    isAlive(): boolean;

    getLocaleTextFunc(): LocaleTextFunc;

    addDestroyFunc(func: () => void): void;

    /** doesn't throw an error if `bean` is undefined */
    createOptionalManagedBean<T extends AgBaseBean<TBeanCollection> | null | undefined>(
        bean: T,
        context?: AgBaseContext<TBeanCollection>
    ): T | undefined;

    createManagedBean<T extends AgBaseBean<TBeanCollection>>(bean: T, context?: AgBaseContext<TBeanCollection>): T;

    createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        context?: AgBaseContext<TBeanCollection> | null,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T;

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    destroyBean<
        T extends
            | AgBean<
                  TBeanCollection,
                  TLocalEventListener,
                  TLocalEventType,
                  TGlobalEvents,
                  TProperties,
                  TPropertyDefaults
              >
            | null
            | undefined,
    >(
        bean: T,
        context?: AgBaseContext<TBeanCollection>
    ): undefined;
}

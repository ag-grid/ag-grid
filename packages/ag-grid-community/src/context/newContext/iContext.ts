import type { AgEvent } from '../../events';
import type { IAgEventEmitter, IEventEmitter, IEventListener } from '../../interfaces/iEventEmitter';
import type { AgFrameworkOverrides } from '../../interfaces/iFrameworkOverrides';
import type { ILocaleService } from '../../misc/locale/localeService';
import type { LocaleTextFunc } from '../../misc/locale/localeUtils';
import type { AgEventService } from './iEvent';
import type { AgPropertyChangedListener, AgPropertyValueChangedListener, BaseProperties } from './iProperties';

export interface AgCoreBeanCollection<
    TPropertiesService,
    TEventType extends string,
    TEventParams extends Record<TEventType, any>,
    TProcessedEvents extends AgEvent,
> {
    context: any;
    eventSvc: AgEventService<TEventType, TEventParams, TProcessedEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: {
        // TODO - extract
        addGlobalCSS(css: string, debugId: string): void;
    };
}

type AgEventHandlers<TEventKey extends string, TEvent = any> = { [K in TEventKey]?: (event?: TEvent) => void };

export interface AgContext<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> {
    createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T;

    getBean<T extends TBeanName>(name: T): TBeanCollection[T];

    destroyBean(bean: AgBaseBean<TBeanCollection> | null | undefined): undefined;

    destroyBeans(beans: (AgBaseBean<TBeanCollection> | null | undefined)[]): [];
}

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

export interface AgBean<
    TBeanName extends string,
    TBeanCollection,
    TBean extends AgBaseBean<TBeanCollection>,
    TContext extends AgContext<TBeanName, TBeanCollection>,
    TLocalEventListener extends IEventListener<TLocalEventType>,
    TLocalEventType extends string,
    TGlobalEventType extends string,
    TGlobalEventParams extends Record<TGlobalEventType, any>,
    TProperties extends BaseProperties,
    TBooleanProperties,
    TPropertiesEventSource,
    TPropertiesEventType extends string,
> extends AgBaseBean<TBeanCollection> {
    addEventListener<T extends TLocalEventType>(eventType: T, listener: TLocalEventListener, async?: boolean): void;

    removeEventListener<T extends TLocalEventType>(eventType: T, listener: TLocalEventListener, async?: boolean): void;

    dispatchLocalEvent<TEvent extends AgEvent<TLocalEventType>>(event: TEvent): void;

    addManagedElementListeners<TEvent extends keyof HTMLElementEventMap>(
        object: Element | Document | ShadowRoot,
        handlers: AgEventHandlers<TEvent, HTMLElementEventMap[TEvent]>
    ): (() => null)[];

    addManagedEventListeners(handlers: {
        [K in TGlobalEventType]?: (event: TGlobalEventParams[K]) => void;
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
        listener: AgPropertyValueChangedListener<TProperties, TBooleanProperties, TPropertiesEventSource, K>
    ): () => null;

    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    addManagedPropertyListeners(
        events: (keyof TProperties)[],
        listener: AgPropertyChangedListener<TProperties, TPropertiesEventType, TPropertiesEventSource>
    ): void;

    isAlive(): boolean;

    getLocaleTextFunc(): LocaleTextFunc;

    addDestroyFunc(func: () => void): void;

    /** doesn't throw an error if `bean` is undefined */
    createOptionalManagedBean<T extends TBean | null | undefined>(bean: T, context?: TContext): T | undefined;

    createManagedBean<T extends TBean>(bean: T, context?: TContext): T;

    createBean<T extends TBean>(bean: T, context?: TContext | null, afterPreCreateCallback?: (bean: TBean) => void): T;

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    destroyBean<T extends TBean | null | undefined>(bean: T, context?: TContext): undefined;
}

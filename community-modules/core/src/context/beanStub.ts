import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { AgEvent, AgEventListener } from "../events";
import { Autowired, Context, PreDestroy } from "./context";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { Component } from "../widgets/component";
import { addSafePassiveEventListener } from "../utils/event";
import { GridOptionsService, PropertyChangedEvent, PropertyChangedListener, PropertyValueChangedEvent, PropertyValueChangedListener } from "../gridOptionsService";
import { GridOptions } from "../entities/gridOptions";
import { LocaleService } from "../localeService";
import { Environment } from "../environment";

export class BeanStub implements IEventEmitter {

    public static EVENT_DESTROYED = 'destroyed';

    protected localEventService: EventService;

    private destroyFunctions: (() => void)[] = [];
    private destroyed = false;

    // for vue 3 - prevents Vue from trying to make this (and obviously any sub classes) from being reactive
    // prevents vue from creating proxies for created objects and prevents identity related issues
    public __v_skip = true;

    @Autowired('frameworkOverrides') private readonly frameworkOverrides: IFrameworkOverrides;
    @Autowired('context') protected readonly context: Context;
    @Autowired('eventService') protected readonly eventService: EventService;
    @Autowired('gridOptionsService') protected readonly gos: GridOptionsService;
    @Autowired('localeService') protected readonly localeService: LocaleService;
    @Autowired('environment') protected readonly environment: Environment;

    // this was a test constructor niall built, when active, it prints after 5 seconds all beans/components that are
    // not destroyed. to use, create a new grid, then api.destroy() before 5 seconds. then anything that gets printed
    // points to a bean or component that was not properly disposed of.
    // constructor() {
    //     setTimeout(()=> {
    //         if (this.isAlive()) {
    //             let prototype: any = Object.getPrototypeOf(this);
    //             const constructor: any = prototype.constructor;
    //             const constructorString = constructor.toString();
    //             const beanName = constructorString.substring(9, constructorString.indexOf("("));
    //             console.log('is alive ' + beanName);
    //         }
    //     }, 5000);
    // }

    // Enable multiple grid properties to be updated together by the user but only trigger shared logic once.
    // Closely related to logic in ComponentUtil.ts
    private lastChangeSetIdLookup: Record<string, number> = {};

    // CellComp and GridComp and override this because they get the FrameworkOverrides from the Beans bean
    protected getFrameworkOverrides(): IFrameworkOverrides {
        return this.frameworkOverrides;
    }

    public getContext(): Context {
        return this.context;
    }

    @PreDestroy
    protected destroy(): void {
        // let prototype: any = Object.getPrototypeOf(this);
        // const constructor: any = prototype.constructor;
        // const constructorString = constructor.toString();
        // const beanName = constructorString.substring(9, constructorString.indexOf("("));

        this.destroyFunctions.forEach(func => func());
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({ type: BeanStub.EVENT_DESTROYED });
    }

    public addEventListener(eventType: string, listener: AgEventListener): void {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }

        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: AgEventListener): void {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }

    public dispatchEvent<T extends AgEvent>(event: T): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }

    public addManagedListener(
        object: Window | HTMLElement | IEventEmitter,
        event: string,
        listener: (event?: any) => void
    ): (() => null) | undefined {
        if (this.destroyed) {
            return;
        }

        if (object instanceof HTMLElement) {
            addSafePassiveEventListener(this.getFrameworkOverrides(), object, event, listener);
        } else {
            object.addEventListener(event, listener);
        }

        const destroyFunc: () => null = () => {
            (object as any).removeEventListener(event, listener);

            this.destroyFunctions = this.destroyFunctions.filter(fn => fn !== destroyFunc);
            return null;
        };

        this.destroyFunctions.push(destroyFunc);

        return destroyFunc;
    }

    private setupGridOptionListener<K extends keyof GridOptions>(
        event: keyof GridOptions,
        listener: PropertyValueChangedListener<K>
    ): (() => null) {
        this.gos.addEventListener(event, listener);
        const destroyFunc: () => null = () => {
            this.gos.removeEventListener(event, listener);
            this.destroyFunctions = this.destroyFunctions.filter((fn) => fn !== destroyFunc);
            return null;
        };
        this.destroyFunctions.push(destroyFunc);
        return destroyFunc;
    }

    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    public addManagedPropertyListener<K extends keyof GridOptions>(
        event: K,
        listener: PropertyValueChangedListener<K>
    ): (() => null) {
        if (this.destroyed) {
            return () => null;
        }

        return this.setupGridOptionListener(event, listener);
    }

    private propertyListenerId = 0;
    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    public addManagedPropertyListeners(
        events: (keyof GridOptions)[],
        listener: PropertyChangedListener
    ): void {
        if (this.destroyed) {
            return;
        }

        // Ensure each set of events can run for the same changeSetId
        const eventsKey = events.join('-') + this.propertyListenerId++;

        const wrappedListener = (event: PropertyValueChangedEvent<any>) => {
            if (event.changeSet) {
                // ChangeSet is only set when the property change is part of a group of changes from ComponentUtils
                // Direct api calls should always be run as 
                if (event.changeSet && event.changeSet.id === this.lastChangeSetIdLookup[eventsKey]) {
                    // Already run the listener for this set of prop changes so don't run again
                    return;
                }
                this.lastChangeSetIdLookup[eventsKey] = event.changeSet.id;
            }
            // Don't expose the underlying event value changes to the group listener.
            const propertiesChangeEvent: PropertyChangedEvent = {
                type: 'gridPropertyChanged',
                changeSet: event.changeSet,
                source: event.source
            };
            listener(propertiesChangeEvent);
        };

        events.forEach((event) => this.setupGridOptionListener(event, wrappedListener));
    }

    public isAlive = (): boolean => !this.destroyed;

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        } else {
            func();
        }
    }

    public createManagedBean<T>(bean: T, context?: Context): T {
        const res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    }

    protected createBean<T>(bean: T, context?: Context | null, afterPreCreateCallback?: (comp: Component) => void): T {
        return (context || this.getContext()).createBean(bean, afterPreCreateCallback);
    }

    protected destroyBean<T>(bean: T, context?: Context): undefined {
        return (context || this.getContext()).destroyBean(bean);
    }

    protected destroyBeans<T>(beans: T[], context?: Context): T[] {
        if (beans) {
            beans.forEach(bean => this.destroyBean(bean, context));
        }

        return [];
    }
}

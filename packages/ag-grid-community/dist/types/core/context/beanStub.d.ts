import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { AgEvent, AgEventListener } from "../events";
import { Context } from "./context";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { Component } from "../widgets/component";
import { GridOptionsService, PropertyChangedListener, PropertyValueChangedListener } from "../gridOptionsService";
import { GridOptions } from "../entities/gridOptions";
import { LocaleService } from "../localeService";
import { Environment } from "../environment";
export declare class BeanStub implements IEventEmitter {
    static EVENT_DESTROYED: string;
    protected localEventService: EventService;
    private destroyFunctions;
    private destroyed;
    __v_skip: boolean;
    private readonly frameworkOverrides;
    protected readonly context: Context;
    protected readonly eventService: EventService;
    protected readonly gridOptionsService: GridOptionsService;
    protected readonly localeService: LocaleService;
    protected readonly environment: Environment;
    private lastChangeSetIdLookup;
    protected getFrameworkOverrides(): IFrameworkOverrides;
    getContext(): Context;
    protected destroy(): void;
    addEventListener(eventType: string, listener: AgEventListener): void;
    removeEventListener(eventType: string, listener: AgEventListener): void;
    dispatchEvent<T extends AgEvent>(event: T): void;
    addManagedListener(object: Window | HTMLElement | IEventEmitter, event: string, listener: (event?: any) => void): (() => null) | undefined;
    private setupGridOptionListener;
    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    addManagedPropertyListener<K extends keyof GridOptions>(event: K, listener: PropertyValueChangedListener<K>): (() => null);
    private propertyListenerId;
    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    addManagedPropertyListeners(events: (keyof GridOptions)[], listener: PropertyChangedListener): void;
    isAlive: () => boolean;
    addDestroyFunc(func: () => void): void;
    createManagedBean<T>(bean: T, context?: Context): T;
    protected createBean<T>(bean: T, context?: Context | null, afterPreCreateCallback?: (comp: Component) => void): T;
    protected destroyBean<T>(bean: T, context?: Context): undefined;
    protected destroyBeans<T>(beans: T[], context?: Context): T[];
}

import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { Context } from "./context";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
export declare class BeanStub implements IEventEmitter {
    static EVENT_DESTROYED: string;
    protected localEventService: EventService;
    private destroyFunctions;
    private destroyed;
    private context;
    private frameworkOverrides;
    protected getFrameworkOverrides(): IFrameworkOverrides;
    getContext: () => Context;
    destroy(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    dispatchEventAsync(event: AgEvent): void;
    dispatchEvent<T extends AgEvent>(event: T): void;
    addDestroyableEventListener(object: Window | HTMLElement | IEventEmitter | GridOptionsWrapper, event: string, listener: (event?: any) => void): (() => void) | undefined;
    isAlive: () => boolean;
    addDestroyFunc(func: () => void): void;
    wireDependentBean<T extends BeanStub>(bean: T, context?: Context): T;
    protected wireBean<T extends BeanStub>(bean: T, context?: Context): T;
}

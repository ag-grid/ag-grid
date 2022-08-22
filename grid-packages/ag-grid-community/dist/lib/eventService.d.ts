import { AgEvent } from "./events";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { LoggerFactory } from "./logger";
export declare class EventService implements IEventEmitter {
    private allSyncListeners;
    private allAsyncListeners;
    private globalSyncListeners;
    private globalAsyncListeners;
    private frameworkOverrides;
    private gridOptionsWrapper?;
    private asyncFunctionsQueue;
    private scheduled;
    private firedEvents;
    setBeans(loggerFactory: LoggerFactory, gridOptionsWrapper: GridOptionsWrapper, frameworkOverrides: IFrameworkOverrides, globalEventListener?: Function | null): void;
    private getListeners;
    noRegisteredListenersExist(): boolean;
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    addGlobalListener(listener: Function, async?: boolean): void;
    removeGlobalListener(listener: Function, async?: boolean): void;
    dispatchEvent(event: AgEvent): void;
    dispatchEventOnce(event: AgEvent): void;
    private dispatchToListeners;
    private dispatchAsync;
    private flushAsyncQueue;
}

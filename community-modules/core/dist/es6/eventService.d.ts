// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { LoggerFactory } from "./logger";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { AgEvent } from "./events";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
export declare class EventService implements IEventEmitter {
    private allSyncListeners;
    private allAsyncListeners;
    private globalSyncListeners;
    private globalAsyncListeners;
    private logger;
    private frameworkOverrides;
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

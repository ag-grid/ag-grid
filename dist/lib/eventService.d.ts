// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { LoggerFactory } from "./logger";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
export declare class EventService implements IEventEmitter {
    private allSyncListeners;
    private allAsyncListeners;
    private globalSyncListeners;
    private globalAsyncListeners;
    private logger;
    private asyncFunctionsQueue;
    private scheduled;
    private static PRIORITY;
    setBeans(loggerFactory: LoggerFactory, gridOptionsWrapper: GridOptionsWrapper, globalEventListener?: Function): void;
    private getListenerList(eventType, async);
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    private assertNotDeprecated(eventType);
    addModalPriorityEventListener(eventType: string, listener: Function, async?: boolean): void;
    addGlobalListener(listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeGlobalListener(listener: Function): void;
    dispatchEvent(eventType: string, event?: any): void;
    private dispatchToListeners(eventType, event, async);
    private dispatchAsync(func);
    private flushAsyncQueue();
}

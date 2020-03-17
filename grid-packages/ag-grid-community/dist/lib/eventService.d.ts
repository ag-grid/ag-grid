import { LoggerFactory } from "./logger";
import { IEventEmitter } from "./interfaces/iEventEmitter";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { AgEvent } from "./events";
export declare class EventService implements IEventEmitter {
    private allSyncListeners;
    private allAsyncListeners;
    private globalSyncListeners;
    private globalAsyncListeners;
    private logger;
    private asyncFunctionsQueue;
    private scheduled;
    private static PRIORITY;
    private firedEvents;
    setBeans(loggerFactory: LoggerFactory, gridOptionsWrapper: GridOptionsWrapper, globalEventListener?: Function): void;
    private getListeners;
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
    addModalPriorityEventListener(eventType: string, listener: Function, async?: boolean): void;
    addGlobalListener(listener: Function, async?: boolean): void;
    removeGlobalListener(listener: Function, async?: boolean): void;
    dispatchEvent(event: AgEvent): void;
    dispatchEventOnce(event: AgEvent): void;
    private dispatchToListeners;
    private dispatchAsync;
    private flushAsyncQueue;
}

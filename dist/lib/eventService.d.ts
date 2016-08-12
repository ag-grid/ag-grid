// Type definitions for ag-grid v5.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "./logger";
import { IEventEmitter } from "./interfaces/iEventEmitter";
export declare class EventService implements IEventEmitter {
    private allListeners;
    private globalListeners;
    private logger;
    private static PRIORITY;
    agWire(loggerFactory: LoggerFactory, globalEventListener?: Function): void;
    private getListenerList(eventType);
    addEventListener(eventType: string, listener: Function): void;
    addModalPriorityEventListener(eventType: string, listener: Function): void;
    addGlobalListener(listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    removeGlobalListener(listener: Function): void;
    dispatchEvent(eventType: string, event?: any): void;
}

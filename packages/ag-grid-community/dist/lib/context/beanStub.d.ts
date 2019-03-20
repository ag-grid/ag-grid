// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { Context } from "./context";
export declare class BeanStub implements IEventEmitter {
    static EVENT_DESTROYED: string;
    private localEventService;
    private destroyFunctions;
    private destroyed;
    private context;
    getContext(): Context;
    destroy(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    dispatchEventAsync(event: AgEvent): void;
    dispatchEvent<T extends AgEvent>(event: T): void;
    addDestroyableEventListener(eElement: Window | HTMLElement | IEventEmitter | GridOptionsWrapper, event: string, listener: (event?: any) => void, options?: boolean | AddEventListenerOptions): void;
    isAlive(): boolean;
    addDestroyFunc(func: () => void): void;
}

// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
export declare class BeanStub implements IEventEmitter {
    static EVENT_DESTROYED: string;
    private localEventService;
    private destroyFunctions;
    private destroyed;
    destroy(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    dispatchEventAsync(event: AgEvent): void;
    dispatchEvent<T extends AgEvent>(event: T): void;
    addDestroyableEventListener(eElement: Window | HTMLElement | IEventEmitter | GridOptionsWrapper, event: string, listener: (event?: any) => void): void;
    isAlive(): boolean;
    addDestroyFunc(func: () => void): void;
}

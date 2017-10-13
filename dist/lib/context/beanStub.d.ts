// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
export declare class BeanStub implements IEventEmitter {
    private localEventService;
    private destroyFunctions;
    destroy(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    dispatchEventAsync(event: AgEvent): void;
    dispatchEvent(event: AgEvent): void;
    addDestroyableEventListener(eElement: HTMLElement | IEventEmitter | GridOptionsWrapper, event: string, listener: (event?: any) => void): void;
    addDestroyFunc(func: () => void): void;
}

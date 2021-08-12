// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IEventEmitter {
    addEventListener(eventType: string, listener: EventListener, async?: boolean, options?: AddEventListenerOptions): void;
    removeEventListener(eventType: string, listener: EventListener, async?: boolean, options?: AddEventListenerOptions): void;
}

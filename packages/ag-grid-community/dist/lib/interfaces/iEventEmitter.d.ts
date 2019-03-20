// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IEventEmitter {
    addEventListener(eventType: string, listener: Function, async?: boolean): void;
    removeEventListener(eventType: string, listener: Function, async?: boolean): void;
}

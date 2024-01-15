// Type definitions for @ag-grid-community/core v31.0.2
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgEventListener } from "../events";
export interface IEventEmitter {
    addEventListener(eventType: string, listener: AgEventListener, async?: boolean, options?: AddEventListenerOptions): void;
    removeEventListener(eventType: string, listener: AgEventListener, async?: boolean, options?: AddEventListenerOptions): void;
}

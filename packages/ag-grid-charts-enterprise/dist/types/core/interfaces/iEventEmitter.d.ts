import { AgEventListener } from "../events";
export interface IEventEmitter {
    addEventListener(eventType: string, listener: AgEventListener, async?: boolean, options?: AddEventListenerOptions): void;
    removeEventListener(eventType: string, listener: AgEventListener, async?: boolean, options?: AddEventListenerOptions): void;
}

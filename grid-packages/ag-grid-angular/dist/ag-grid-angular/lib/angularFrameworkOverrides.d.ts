import { NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
export declare class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    private _ngZone;
    private isEmitterUsed;
    constructor(_ngZone: NgZone);
    setEmitterUsedCallback(isEmitterUsed: (eventType: string) => boolean): void;
    setTimeout(action: any, timeout?: any): void;
    addEventListener(element: HTMLElement, eventType: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void;
    dispatchEvent(eventType: string, listener: () => {}): void;
}

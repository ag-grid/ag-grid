import { NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
export declare class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    private _ngZone;
    constructor(_ngZone: NgZone);
    setTimeout(action: any, timeout?: any): void;
    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void;
}

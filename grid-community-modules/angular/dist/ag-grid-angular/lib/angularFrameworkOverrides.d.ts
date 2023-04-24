import { NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import { AgPromise } from "@ag-grid-community/core";
import * as i0 from "@angular/core";
export declare class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    private _ngZone;
    private isEmitterUsed;
    constructor(_ngZone: NgZone);
    setEmitterUsedCallback(isEmitterUsed: (eventType: string) => boolean): void;
    setTimeout(action: any, timeout?: any): void;
    setInterval(action: any, interval?: any): AgPromise<number>;
    addEventListener(element: HTMLElement, eventType: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void;
    dispatchEvent(eventType: string, listener: () => {}, global?: boolean): void;
    isFrameworkComponent(comp: any): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFrameworkOverrides, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFrameworkOverrides>;
}

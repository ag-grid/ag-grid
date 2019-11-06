import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "ag-grid-community";

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(private _ngZone: NgZone) {
        super();
    }

    public setTimeout(action: any, timeout?: any): void {
        this._ngZone.runOutsideAngular(() => {
            window.setTimeout(() => {
                action();
            }, timeout);
        });
    }

    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void {
        this._ngZone.runOutsideAngular(() => {
            super.addEventListenerOutsideAngular(element, type, listener, useCapture);
        });
    }
}

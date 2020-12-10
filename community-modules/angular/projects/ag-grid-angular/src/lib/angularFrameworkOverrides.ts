import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "@ag-grid-community/core";

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    private isEmitterUsed: (eventType: string) => boolean;

    constructor(private _ngZone: NgZone) {
        super();
    }

    setEmitterUsedCallback(isEmitterUsed: (eventType: string) => boolean) {
        this.isEmitterUsed = isEmitterUsed;

    }

    public setTimeout(action: any, timeout?: any): void {
        this._ngZone.runOutsideAngular(() => {
            window.setTimeout(() => {
                action();
            }, timeout);
        });
    }

    addEventListener(element: HTMLElement, eventType: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void {
        if (this.isOutsideAngular(eventType)) {
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener(eventType, listener, useCapture);
            });
        } else {
            element.addEventListener(eventType, listener, useCapture);
        }
    }

    dispatchEvent(eventType: string, listener: () => {}): void {
        if (this.isOutsideAngular(eventType)) {
            this._ngZone.runOutsideAngular(listener);
        } else if(this.isEmitterUsed(eventType)) {
            // only trigger off events (and potentially change detection) if actually used
            if(!NgZone.isInAngularZone()) {
                this._ngZone.run(listener);
            } else {
                listener();
            }
        }
    }
}

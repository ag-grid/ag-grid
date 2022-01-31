import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "@ag-grid-community/core";
import {AgPromise} from "@ag-grid-community/core";

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
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                window.setTimeout(() => {
                    action();
                }, timeout);
            });
        } else {
            window.setTimeout(() => {
                action();
            }, timeout);
        }
    }

    public setInterval(action: any, interval?: any): AgPromise<number> {
        return new AgPromise<number>(resolve => {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(() => {
                    resolve(window.setInterval(() => {
                            action();
                        }, interval)
                    );
                });
            } else {
                resolve(window.setInterval(() => {
                        action();
                    }, interval)
                );
            }
        });
    }

    addEventListener(element: HTMLElement, eventType: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void {
        if (this.isOutsideAngular(eventType) && this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener(eventType, listener, useCapture);
            });
        } else {
            element.addEventListener(eventType, listener, useCapture);
        }
    }

    dispatchEvent(eventType: string, listener: () => {}, global = false): void {
        if (this.isOutsideAngular(eventType)) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(listener);
            } else {
                listener();
            }
        } else if (this.isEmitterUsed(eventType) || global) {
            // only trigger off events (and potentially change detection) if actually used
            if (!NgZone.isInAngularZone() && this._ngZone) {
                this._ngZone.run(listener);
            } else {
                listener();
            }
        }
    }

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }
}

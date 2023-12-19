import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "ag-grid-community";

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(private _ngZone: NgZone) {
        super('angular');
    }

    dispatchEvent(listener: () => void): void {
        // Make all events run outside Angular as they often trigger the setup of event listeners
        // By having the event listeners outside Angular we can avoid triggering change detection
        // Check for _ngZone existence as it is not present when Zoneless
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(listener);
        } else {
            listener();
        }
    }

    /**
     * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
     * This means users can update templates and use binding without having to do anything extra.
     */
    wrapOutgoing<T>( callback: () => T): T {
        return this._ngZone ? this._ngZone.run(callback) : callback();
    }

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }
}

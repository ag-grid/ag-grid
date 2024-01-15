import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "ag-grid-community";

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(private _ngZone: NgZone) {
        super('angular');
    }

    // Make all events run outside Angular as they often trigger the setup of event listeners
    // By having the event listeners outside Angular we can avoid triggering change detection
    // This also means that if a user calls an AG Grid API method from within their component
    // the internal side effects will not trigger change detection. Without this the events would
    // run inside Angular and trigger change detection as the source of the event was within the angular zone.
    wrapIncoming: <T>(callback: () => T) => T  = (callback) => this.runOutsideAngular(callback);

    // Only setup wrapping when the call is coming from within Angular zone, i.e from a users application code.
    // Used to distinguish between user code and AG Grid code setting up events against RowNodes and Columns
    get shouldWrapOutgoing() {
        return this._ngZone && NgZone.isInAngularZone(); 
    }

    /**
     * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
     * This means users can update templates and use binding without having to do anything extra.
     */
    wrapOutgoing: <T>( callback: () => T) => T = (callback) => this.runInsideAngular(callback);

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }

    runInsideAngular<T>( callback: () => T): T {
        // Check for _ngZone existence as it is not present when Zoneless
        return this._ngZone ? this._ngZone.run(callback) : callback();
    }
    runOutsideAngular<T>( callback: () => T): T {
        return this._ngZone ? this._ngZone.runOutsideAngular(callback) : callback();
    }
}

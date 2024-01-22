import {Injectable, NgZone} from "@angular/core";
import {VanillaFrameworkOverrides} from "@ag-grid-community/core";

@Injectable()
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    // Flag used to control Zone behaviour when running tests as many test features rely on Zone.
    private isRunningWithinTestZone: boolean = false;
    constructor(private _ngZone: NgZone ) {
        super('angular');
        this.isRunningWithinTestZone = (window as any)?.AG_GRID_UNDER_TEST ?? !!((window as any)?.Zone?.AsyncTestZoneSpec);
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
    runOutsideAngular<T>(callback: () => T, source: 'ag-grid-angular' | undefined = undefined): T {
        if(!this.isRunningWithinTestZone){
            return this._ngZone ? this._ngZone.runOutsideAngular(callback) : callback();
        }

        // Special handling when running inside the test zone.
        if (this._ngZone) {
            if (source == 'ag-grid-angular') {
                // We still need to run the setup code outside of Angular otherwise tests will fail as they never go stable.
                // Have not found the root cause that prevents the tests from going stable when the setup code is run inside Angular.
                const res = this._ngZone.runOutsideAngular(callback);
                // Add a setTimeout to ensure that there is something for fixture.whenStable to wait for.
                setTimeout(() => {}, 0);
                return res;
            }
            // If the source is not ag-grid-angular and we are running inside the test zone we just let the grid run inside the test zone.
            // This means all the normal operations should control when the fixture is stable without any other speacial handling.
        }
        return callback();
    }
}

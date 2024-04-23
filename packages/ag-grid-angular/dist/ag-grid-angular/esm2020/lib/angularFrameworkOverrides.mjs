import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import * as i0 from "@angular/core";
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super('angular');
        this._ngZone = _ngZone;
        // Flag used to control Zone behaviour when running tests as many test features rely on Zone.
        this.isRunningWithinTestZone = false;
        // Make all events run outside Angular as they often trigger the setup of event listeners
        // By having the event listeners outside Angular we can avoid triggering change detection
        // This also means that if a user calls an AG Grid API method from within their component
        // the internal side effects will not trigger change detection. Without this the events would
        // run inside Angular and trigger change detection as the source of the event was within the angular zone.
        this.wrapIncoming = (callback, source) => this.runOutside(callback, source);
        /**
         * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
         * This means users can update templates and use binding without having to do anything extra.
         */
        this.wrapOutgoing = (callback) => this.runInsideAngular(callback);
        this.isRunningWithinTestZone = window?.AG_GRID_UNDER_TEST ?? !!(window?.Zone?.AsyncTestZoneSpec);
        if (!this._ngZone) {
            this.runOutside = (callback) => callback();
        }
        else if (this.isRunningWithinTestZone) {
            this.runOutside = (callback, source) => {
                if (source === 'resize-observer') {
                    // ensure resize observer callbacks are run outside of Angular even under test due to Jest not supporting ResizeObserver
                    // which means it just loops continuously with a setTimeout with no way to flush the queue or have fixture.whenStable() resolve.
                    return this._ngZone.runOutsideAngular(callback);
                }
                // When under test run inside Angular so that tests can use fixture.whenStable() to wait for async operations to complete.
                return callback();
            };
        }
        else {
            this.runOutside = (callback) => this._ngZone.runOutsideAngular(callback);
        }
    }
    // Only setup wrapping when the call is coming from within Angular zone, i.e from a users application code.
    // Used to distinguish between user code and AG Grid code setting up events against RowNodes and Columns
    get shouldWrapOutgoing() {
        return this._ngZone && NgZone.isInAngularZone();
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }
    runInsideAngular(callback) {
        // Check for _ngZone existence as it is not present when Zoneless
        return this._ngZone ? this._ngZone.run(callback) : callback();
    }
    runOutsideAngular(callback, source) {
        return this.runOutside(callback, source);
    }
}
AngularFrameworkOverrides.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFrameworkOverrides.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHlCQUF5QixFQUFtQyxNQUFNLG1CQUFtQixDQUFDOztBQUc5RixNQUFNLE9BQU8seUJBQTBCLFNBQVEseUJBQXlCO0lBTXBFLFlBQW9CLE9BQWU7UUFDL0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBREQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUxuQyw2RkFBNkY7UUFDckYsNEJBQXVCLEdBQVksS0FBSyxDQUFDO1FBMEJqRCx5RkFBeUY7UUFDekYseUZBQXlGO1FBQ3pGLHlGQUF5RjtRQUN6Riw2RkFBNkY7UUFDN0YsMEdBQTBHO1FBQzFHLGlCQUFZLEdBQTRFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFRaEo7OztXQUdHO1FBQ0gsaUJBQVksR0FBaUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQXBDdkYsSUFBSSxDQUFDLHVCQUF1QixHQUFJLE1BQWMsRUFBRSxrQkFBa0IsSUFBSSxDQUFDLENBQUMsQ0FBRSxNQUFjLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFbkgsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QzthQUFNLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLElBQUksTUFBTSxLQUFLLGlCQUFpQixFQUFFO29CQUM5Qix3SEFBd0g7b0JBQ3hILGdJQUFnSTtvQkFDaEksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCwwSEFBMEg7Z0JBQzFILE9BQU8sUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDO1NBQ0w7YUFBSztZQUNGLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUU7SUFDTCxDQUFDO0lBU0QsMkdBQTJHO0lBQzNHLHdHQUF3RztJQUN4RyxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFRRCxvQkFBb0IsQ0FBQyxJQUFTO1FBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsTUFBTSxhQUFhLEdBQUcsU0FBUyxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUM7UUFDekQsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVELGdCQUFnQixDQUFLLFFBQWlCO1FBQ2xDLGlFQUFpRTtRQUNqRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRSxDQUFDO0lBRUQsaUJBQWlCLENBQUksUUFBaUIsRUFBRSxNQUF5QztRQUM3RSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLENBQUM7O3NIQTdEUSx5QkFBeUI7MEhBQXpCLHlCQUF5QjsyRkFBekIseUJBQXlCO2tCQURyQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMsIEZyYW1ld29ya092ZXJyaWRlc0luY29taW5nU291cmNlfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICAvLyBGbGFnIHVzZWQgdG8gY29udHJvbCBab25lIGJlaGF2aW91ciB3aGVuIHJ1bm5pbmcgdGVzdHMgYXMgbWFueSB0ZXN0IGZlYXR1cmVzIHJlbHkgb24gWm9uZS5cbiAgICBwcml2YXRlIGlzUnVubmluZ1dpdGhpblRlc3Rab25lOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIHJ1bk91dHNpZGU6IDxUPihjYWxsYmFjazogKCkgPT4gVCwgc291cmNlPzogRnJhbWV3b3JrT3ZlcnJpZGVzSW5jb21pbmdTb3VyY2UpID0+IFQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSApIHtcbiAgICAgICAgc3VwZXIoJ2FuZ3VsYXInKTtcblxuICAgICAgICB0aGlzLmlzUnVubmluZ1dpdGhpblRlc3Rab25lID0gKHdpbmRvdyBhcyBhbnkpPy5BR19HUklEX1VOREVSX1RFU1QgPz8gISEoKHdpbmRvdyBhcyBhbnkpPy5ab25lPy5Bc3luY1Rlc3Rab25lU3BlYyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5ydW5PdXRzaWRlID0gKGNhbGxiYWNrKSA9PiBjYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNSdW5uaW5nV2l0aGluVGVzdFpvbmUpIHtcbiAgICAgICAgICAgIHRoaXMucnVuT3V0c2lkZSA9IChjYWxsYmFjaywgc291cmNlKSA9PntcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlID09PSAncmVzaXplLW9ic2VydmVyJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgcmVzaXplIG9ic2VydmVyIGNhbGxiYWNrcyBhcmUgcnVuIG91dHNpZGUgb2YgQW5ndWxhciBldmVuIHVuZGVyIHRlc3QgZHVlIHRvIEplc3Qgbm90IHN1cHBvcnRpbmcgUmVzaXplT2JzZXJ2ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpY2ggbWVhbnMgaXQganVzdCBsb29wcyBjb250aW51b3VzbHkgd2l0aCBhIHNldFRpbWVvdXQgd2l0aCBubyB3YXkgdG8gZmx1c2ggdGhlIHF1ZXVlIG9yIGhhdmUgZml4dHVyZS53aGVuU3RhYmxlKCkgcmVzb2x2ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdW5kZXIgdGVzdCBydW4gaW5zaWRlIEFuZ3VsYXIgc28gdGhhdCB0ZXN0cyBjYW4gdXNlIGZpeHR1cmUud2hlblN0YWJsZSgpIHRvIHdhaXQgZm9yIGFzeW5jIG9wZXJhdGlvbnMgdG8gY29tcGxldGUuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICB0aGlzLnJ1bk91dHNpZGUgPSAoY2FsbGJhY2spID0+IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIGFsbCBldmVudHMgcnVuIG91dHNpZGUgQW5ndWxhciBhcyB0aGV5IG9mdGVuIHRyaWdnZXIgdGhlIHNldHVwIG9mIGV2ZW50IGxpc3RlbmVyc1xuICAgIC8vIEJ5IGhhdmluZyB0aGUgZXZlbnQgbGlzdGVuZXJzIG91dHNpZGUgQW5ndWxhciB3ZSBjYW4gYXZvaWQgdHJpZ2dlcmluZyBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAgLy8gVGhpcyBhbHNvIG1lYW5zIHRoYXQgaWYgYSB1c2VyIGNhbGxzIGFuIEFHIEdyaWQgQVBJIG1ldGhvZCBmcm9tIHdpdGhpbiB0aGVpciBjb21wb25lbnRcbiAgICAvLyB0aGUgaW50ZXJuYWwgc2lkZSBlZmZlY3RzIHdpbGwgbm90IHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbi4gV2l0aG91dCB0aGlzIHRoZSBldmVudHMgd291bGRcbiAgICAvLyBydW4gaW5zaWRlIEFuZ3VsYXIgYW5kIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbiBhcyB0aGUgc291cmNlIG9mIHRoZSBldmVudCB3YXMgd2l0aGluIHRoZSBhbmd1bGFyIHpvbmUuXG4gICAgd3JhcEluY29taW5nOiA8VD4oY2FsbGJhY2s6ICgpID0+IFQsIHNvdXJjZT86IEZyYW1ld29ya092ZXJyaWRlc0luY29taW5nU291cmNlKSA9PiBUICA9IChjYWxsYmFjaywgc291cmNlKSA9PiB0aGlzLnJ1bk91dHNpZGUoY2FsbGJhY2ssIHNvdXJjZSk7XG5cbiAgICAvLyBPbmx5IHNldHVwIHdyYXBwaW5nIHdoZW4gdGhlIGNhbGwgaXMgY29taW5nIGZyb20gd2l0aGluIEFuZ3VsYXIgem9uZSwgaS5lIGZyb20gYSB1c2VycyBhcHBsaWNhdGlvbiBjb2RlLlxuICAgIC8vIFVzZWQgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlbiB1c2VyIGNvZGUgYW5kIEFHIEdyaWQgY29kZSBzZXR0aW5nIHVwIGV2ZW50cyBhZ2FpbnN0IFJvd05vZGVzIGFuZCBDb2x1bW5zXG4gICAgZ2V0IHNob3VsZFdyYXBPdXRnb2luZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25nWm9uZSAmJiBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCk7IFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2Ugc3VyZSB0aGF0IGFueSBjb2RlIHRoYXQgaXMgZXhlY3V0ZWQgb3V0c2lkZSBvZiBBRyBHcmlkIGlzIHJ1bm5pbmcgd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAgICogVGhpcyBtZWFucyB1c2VycyBjYW4gdXBkYXRlIHRlbXBsYXRlcyBhbmQgdXNlIGJpbmRpbmcgd2l0aG91dCBoYXZpbmcgdG8gZG8gYW55dGhpbmcgZXh0cmEuXG4gICAgICovXG4gICAgd3JhcE91dGdvaW5nOiA8VD4oIGNhbGxiYWNrOiAoKSA9PiBUKSA9PiBUID0gKGNhbGxiYWNrKSA9PiB0aGlzLnJ1bkluc2lkZUFuZ3VsYXIoY2FsbGJhY2spO1xuXG4gICAgaXNGcmFtZXdvcmtDb21wb25lbnQoY29tcDogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghY29tcCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgY29uc3QgcHJvdG90eXBlID0gY29tcC5wcm90b3R5cGU7XG4gICAgICAgIGNvbnN0IGlzQW5ndWxhckNvbXAgPSBwcm90b3R5cGUgJiYgJ2FnSW5pdCcgaW4gcHJvdG90eXBlO1xuICAgICAgICByZXR1cm4gaXNBbmd1bGFyQ29tcDtcbiAgICB9XG5cbiAgICBydW5JbnNpZGVBbmd1bGFyPFQ+KCBjYWxsYmFjazogKCkgPT4gVCk6IFQge1xuICAgICAgICAvLyBDaGVjayBmb3IgX25nWm9uZSBleGlzdGVuY2UgYXMgaXQgaXMgbm90IHByZXNlbnQgd2hlbiBab25lbGVzc1xuICAgICAgICByZXR1cm4gdGhpcy5fbmdab25lID8gdGhpcy5fbmdab25lLnJ1bihjYWxsYmFjaykgOiBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHJ1bk91dHNpZGVBbmd1bGFyPFQ+KGNhbGxiYWNrOiAoKSA9PiBULCBzb3VyY2U/OiBGcmFtZXdvcmtPdmVycmlkZXNJbmNvbWluZ1NvdXJjZSk6IFQge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5PdXRzaWRlKGNhbGxiYWNrLCBzb3VyY2UpO1xuICAgIH1cbn1cbiJdfQ==
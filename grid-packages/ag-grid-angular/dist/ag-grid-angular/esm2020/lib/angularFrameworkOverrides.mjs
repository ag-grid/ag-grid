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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHlCQUF5QixFQUFtQyxNQUFNLG1CQUFtQixDQUFDOztBQUc5RixNQUFNLE9BQU8seUJBQTBCLFNBQVEseUJBQXlCO0lBTXBFLFlBQW9CLE9BQWU7UUFDL0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBREQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUxuQyw2RkFBNkY7UUFDckYsNEJBQXVCLEdBQVksS0FBSyxDQUFDO1FBMEJqRCx5RkFBeUY7UUFDekYseUZBQXlGO1FBQ3pGLHlGQUF5RjtRQUN6Riw2RkFBNkY7UUFDN0YsMEdBQTBHO1FBQzFHLGlCQUFZLEdBQTRFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFRaEo7OztXQUdHO1FBQ0gsaUJBQVksR0FBaUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQXBDdkYsSUFBSSxDQUFDLHVCQUF1QixHQUFJLE1BQWMsRUFBRSxrQkFBa0IsSUFBSSxDQUFDLENBQUMsQ0FBRSxNQUFjLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFbkgsSUFBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUM7WUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QzthQUFLLElBQUcsSUFBSSxDQUFDLHVCQUF1QixFQUFDO1lBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLElBQUcsTUFBTSxLQUFLLGlCQUFpQixFQUFDO29CQUM1Qix3SEFBd0g7b0JBQ3hILGdJQUFnSTtvQkFDaEksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCwwSEFBMEg7Z0JBQzFILE9BQU8sUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDO1NBQ0w7YUFBSTtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUU7SUFDTCxDQUFDO0lBU0QsMkdBQTJHO0lBQzNHLHdHQUF3RztJQUN4RyxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFRRCxvQkFBb0IsQ0FBQyxJQUFTO1FBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsTUFBTSxhQUFhLEdBQUcsU0FBUyxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUM7UUFDekQsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVELGdCQUFnQixDQUFLLFFBQWlCO1FBQ2xDLGlFQUFpRTtRQUNqRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRSxDQUFDO0lBRUQsaUJBQWlCLENBQUksUUFBaUIsRUFBRSxNQUF5QztRQUM3RSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzdDLENBQUM7O3NIQTdEUSx5QkFBeUI7MEhBQXpCLHlCQUF5QjsyRkFBekIseUJBQXlCO2tCQURyQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMsIEZyYW1ld29ya092ZXJyaWRlc0luY29taW5nU291cmNlfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICAvLyBGbGFnIHVzZWQgdG8gY29udHJvbCBab25lIGJlaGF2aW91ciB3aGVuIHJ1bm5pbmcgdGVzdHMgYXMgbWFueSB0ZXN0IGZlYXR1cmVzIHJlbHkgb24gWm9uZS5cbiAgICBwcml2YXRlIGlzUnVubmluZ1dpdGhpblRlc3Rab25lOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIHJ1bk91dHNpZGU6IDxUPihjYWxsYmFjazogKCkgPT4gVCwgc291cmNlPzogRnJhbWV3b3JrT3ZlcnJpZGVzSW5jb21pbmdTb3VyY2UpID0+IFQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSApIHtcbiAgICAgICAgc3VwZXIoJ2FuZ3VsYXInKTtcblxuICAgICAgICB0aGlzLmlzUnVubmluZ1dpdGhpblRlc3Rab25lID0gKHdpbmRvdyBhcyBhbnkpPy5BR19HUklEX1VOREVSX1RFU1QgPz8gISEoKHdpbmRvdyBhcyBhbnkpPy5ab25lPy5Bc3luY1Rlc3Rab25lU3BlYyk7XG4gICAgICAgIFxuICAgICAgICBpZighdGhpcy5fbmdab25lKXtcbiAgICAgICAgICAgIHRoaXMucnVuT3V0c2lkZSA9IChjYWxsYmFjaykgPT4gY2FsbGJhY2soKTtcbiAgICAgICAgfWVsc2UgaWYodGhpcy5pc1J1bm5pbmdXaXRoaW5UZXN0Wm9uZSl7XG4gICAgICAgICAgICB0aGlzLnJ1bk91dHNpZGUgPSAoY2FsbGJhY2ssIHNvdXJjZSkgPT57XG4gICAgICAgICAgICAgICAgaWYoc291cmNlID09PSAncmVzaXplLW9ic2VydmVyJyl7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVuc3VyZSByZXNpemUgb2JzZXJ2ZXIgY2FsbGJhY2tzIGFyZSBydW4gb3V0c2lkZSBvZiBBbmd1bGFyIGV2ZW4gdW5kZXIgdGVzdCBkdWUgdG8gSmVzdCBub3Qgc3VwcG9ydGluZyBSZXNpemVPYnNlcnZlclxuICAgICAgICAgICAgICAgICAgICAvLyB3aGljaCBtZWFucyBpdCBqdXN0IGxvb3BzIGNvbnRpbnVvdXNseSB3aXRoIGEgc2V0VGltZW91dCB3aXRoIG5vIHdheSB0byBmbHVzaCB0aGUgcXVldWUgb3IgaGF2ZSBmaXh0dXJlLndoZW5TdGFibGUoKSByZXNvbHZlLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB1bmRlciB0ZXN0IHJ1biBpbnNpZGUgQW5ndWxhciBzbyB0aGF0IHRlc3RzIGNhbiB1c2UgZml4dHVyZS53aGVuU3RhYmxlKCkgdG8gd2FpdCBmb3IgYXN5bmMgb3BlcmF0aW9ucyB0byBjb21wbGV0ZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5ydW5PdXRzaWRlID0gKGNhbGxiYWNrKSA9PiB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFrZSBhbGwgZXZlbnRzIHJ1biBvdXRzaWRlIEFuZ3VsYXIgYXMgdGhleSBvZnRlbiB0cmlnZ2VyIHRoZSBzZXR1cCBvZiBldmVudCBsaXN0ZW5lcnNcbiAgICAvLyBCeSBoYXZpbmcgdGhlIGV2ZW50IGxpc3RlbmVycyBvdXRzaWRlIEFuZ3VsYXIgd2UgY2FuIGF2b2lkIHRyaWdnZXJpbmcgY2hhbmdlIGRldGVjdGlvblxuICAgIC8vIFRoaXMgYWxzbyBtZWFucyB0aGF0IGlmIGEgdXNlciBjYWxscyBhbiBBRyBHcmlkIEFQSSBtZXRob2QgZnJvbSB3aXRoaW4gdGhlaXIgY29tcG9uZW50XG4gICAgLy8gdGhlIGludGVybmFsIHNpZGUgZWZmZWN0cyB3aWxsIG5vdCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb24uIFdpdGhvdXQgdGhpcyB0aGUgZXZlbnRzIHdvdWxkXG4gICAgLy8gcnVuIGluc2lkZSBBbmd1bGFyIGFuZCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb24gYXMgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnQgd2FzIHdpdGhpbiB0aGUgYW5ndWxhciB6b25lLlxuICAgIHdyYXBJbmNvbWluZzogPFQ+KGNhbGxiYWNrOiAoKSA9PiBULCBzb3VyY2U/OiBGcmFtZXdvcmtPdmVycmlkZXNJbmNvbWluZ1NvdXJjZSkgPT4gVCAgPSAoY2FsbGJhY2ssIHNvdXJjZSkgPT4gdGhpcy5ydW5PdXRzaWRlKGNhbGxiYWNrLCBzb3VyY2UpO1xuXG4gICAgLy8gT25seSBzZXR1cCB3cmFwcGluZyB3aGVuIHRoZSBjYWxsIGlzIGNvbWluZyBmcm9tIHdpdGhpbiBBbmd1bGFyIHpvbmUsIGkuZSBmcm9tIGEgdXNlcnMgYXBwbGljYXRpb24gY29kZS5cbiAgICAvLyBVc2VkIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gdXNlciBjb2RlIGFuZCBBRyBHcmlkIGNvZGUgc2V0dGluZyB1cCBldmVudHMgYWdhaW5zdCBSb3dOb2RlcyBhbmQgQ29sdW1uc1xuICAgIGdldCBzaG91bGRXcmFwT3V0Z29pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUgJiYgTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpOyBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHN1cmUgdGhhdCBhbnkgY29kZSB0aGF0IGlzIGV4ZWN1dGVkIG91dHNpZGUgb2YgQUcgR3JpZCBpcyBydW5uaW5nIHdpdGhpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgICAqIFRoaXMgbWVhbnMgdXNlcnMgY2FuIHVwZGF0ZSB0ZW1wbGF0ZXMgYW5kIHVzZSBiaW5kaW5nIHdpdGhvdXQgaGF2aW5nIHRvIGRvIGFueXRoaW5nIGV4dHJhLlxuICAgICAqL1xuICAgIHdyYXBPdXRnb2luZzogPFQ+KCBjYWxsYmFjazogKCkgPT4gVCkgPT4gVCA9IChjYWxsYmFjaykgPT4gdGhpcy5ydW5JbnNpZGVBbmd1bGFyKGNhbGxiYWNrKTtcblxuICAgIGlzRnJhbWV3b3JrQ29tcG9uZW50KGNvbXA6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWNvbXApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGNvbnN0IHByb3RvdHlwZSA9IGNvbXAucHJvdG90eXBlO1xuICAgICAgICBjb25zdCBpc0FuZ3VsYXJDb21wID0gcHJvdG90eXBlICYmICdhZ0luaXQnIGluIHByb3RvdHlwZTtcbiAgICAgICAgcmV0dXJuIGlzQW5ndWxhckNvbXA7XG4gICAgfVxuXG4gICAgcnVuSW5zaWRlQW5ndWxhcjxUPiggY2FsbGJhY2s6ICgpID0+IFQpOiBUIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIF9uZ1pvbmUgZXhpc3RlbmNlIGFzIGl0IGlzIG5vdCBwcmVzZW50IHdoZW4gWm9uZWxlc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuX25nWm9uZSA/IHRoaXMuX25nWm9uZS5ydW4oY2FsbGJhY2spIDogY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBydW5PdXRzaWRlQW5ndWxhcjxUPihjYWxsYmFjazogKCkgPT4gVCwgc291cmNlPzogRnJhbWV3b3JrT3ZlcnJpZGVzSW5jb21pbmdTb3VyY2UpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuT3V0c2lkZShjYWxsYmFjaywgc291cmNlKTtcbiAgICB9XG59XG4iXX0=
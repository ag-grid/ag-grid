import { VanillaFrameworkOverrides } from '@ag-grid-community/core';
import { Injectable, NgZone } from '@angular/core';
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
        this.isRunningWithinTestZone =
            window?.AG_GRID_UNDER_TEST ?? !!window?.Zone?.AsyncTestZoneSpec;
        if (!this._ngZone) {
            this.runOutside = (callback) => callback();
        }
        else if (this.isRunningWithinTestZone) {
            this.runOutside = (callback, source) => {
                if (source === 'resize-observer' || source === 'popupPositioning') {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AngularFrameworkOverrides }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBR25ELE1BQU0sT0FBTyx5QkFBMEIsU0FBUSx5QkFBeUI7SUFNcEUsWUFBb0IsT0FBZTtRQUMvQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFERCxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBTG5DLDZGQUE2RjtRQUNyRiw0QkFBdUIsR0FBWSxLQUFLLENBQUM7UUEyQmpELHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYseUZBQXlGO1FBQ3pGLDZGQUE2RjtRQUM3RiwwR0FBMEc7UUFDMUcsaUJBQVksR0FBMkUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FDeEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFRdEM7OztXQUdHO1FBQ0gsaUJBQVksR0FBZ0MsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQXRDdEYsSUFBSSxDQUFDLHVCQUF1QjtZQUN2QixNQUFjLEVBQUUsa0JBQWtCLElBQUksQ0FBQyxDQUFFLE1BQWMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUM7UUFFdEYsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM5QzthQUFNLElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLElBQUksTUFBTSxLQUFLLGlCQUFpQixJQUFJLE1BQU0sS0FBSyxrQkFBa0IsRUFBRTtvQkFDL0Qsd0hBQXdIO29CQUN4SCxnSUFBZ0k7b0JBQ2hJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbkQ7Z0JBQ0QsMEhBQTBIO2dCQUMxSCxPQUFPLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUMsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVFO0lBQ0wsQ0FBQztJQVVELDJHQUEyRztJQUMzRyx3R0FBd0c7SUFDeEcsSUFBSSxrQkFBa0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0lBUUQsb0JBQW9CLENBQUMsSUFBUztRQUMxQixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sYUFBYSxHQUFHLFNBQVMsSUFBSSxRQUFRLElBQUksU0FBUyxDQUFDO1FBQ3pELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBSSxRQUFpQjtRQUNqQyxpRUFBaUU7UUFDakUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEUsQ0FBQztJQUVELGlCQUFpQixDQUFJLFFBQWlCLEVBQUUsTUFBeUM7UUFDN0UsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM3QyxDQUFDOytHQWpFUSx5QkFBeUI7bUhBQXpCLHlCQUF5Qjs7NEZBQXpCLHlCQUF5QjtrQkFEckMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRnJhbWV3b3JrT3ZlcnJpZGVzSW5jb21pbmdTb3VyY2UgfSBmcm9tICdAYWctZ3JpZC1jb21tdW5pdHkvY29yZSc7XG5pbXBvcnQgeyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSAnQGFnLWdyaWQtY29tbXVuaXR5L2NvcmUnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIGV4dGVuZHMgVmFuaWxsYUZyYW1ld29ya092ZXJyaWRlcyB7XG4gICAgLy8gRmxhZyB1c2VkIHRvIGNvbnRyb2wgWm9uZSBiZWhhdmlvdXIgd2hlbiBydW5uaW5nIHRlc3RzIGFzIG1hbnkgdGVzdCBmZWF0dXJlcyByZWx5IG9uIFpvbmUuXG4gICAgcHJpdmF0ZSBpc1J1bm5pbmdXaXRoaW5UZXN0Wm9uZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBydW5PdXRzaWRlOiA8VD4oY2FsbGJhY2s6ICgpID0+IFQsIHNvdXJjZT86IEZyYW1ld29ya092ZXJyaWRlc0luY29taW5nU291cmNlKSA9PiBUO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoJ2FuZ3VsYXInKTtcblxuICAgICAgICB0aGlzLmlzUnVubmluZ1dpdGhpblRlc3Rab25lID1cbiAgICAgICAgICAgICh3aW5kb3cgYXMgYW55KT8uQUdfR1JJRF9VTkRFUl9URVNUID8/ICEhKHdpbmRvdyBhcyBhbnkpPy5ab25lPy5Bc3luY1Rlc3Rab25lU3BlYztcblxuICAgICAgICBpZiAoIXRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5ydW5PdXRzaWRlID0gKGNhbGxiYWNrKSA9PiBjYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNSdW5uaW5nV2l0aGluVGVzdFpvbmUpIHtcbiAgICAgICAgICAgIHRoaXMucnVuT3V0c2lkZSA9IChjYWxsYmFjaywgc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gJ3Jlc2l6ZS1vYnNlcnZlcicgfHwgc291cmNlID09PSAncG9wdXBQb3NpdGlvbmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZW5zdXJlIHJlc2l6ZSBvYnNlcnZlciBjYWxsYmFja3MgYXJlIHJ1biBvdXRzaWRlIG9mIEFuZ3VsYXIgZXZlbiB1bmRlciB0ZXN0IGR1ZSB0byBKZXN0IG5vdCBzdXBwb3J0aW5nIFJlc2l6ZU9ic2VydmVyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIG1lYW5zIGl0IGp1c3QgbG9vcHMgY29udGludW91c2x5IHdpdGggYSBzZXRUaW1lb3V0IHdpdGggbm8gd2F5IHRvIGZsdXNoIHRoZSBxdWV1ZSBvciBoYXZlIGZpeHR1cmUud2hlblN0YWJsZSgpIHJlc29sdmUuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHVuZGVyIHRlc3QgcnVuIGluc2lkZSBBbmd1bGFyIHNvIHRoYXQgdGVzdHMgY2FuIHVzZSBmaXh0dXJlLndoZW5TdGFibGUoKSB0byB3YWl0IGZvciBhc3luYyBvcGVyYXRpb25zIHRvIGNvbXBsZXRlLlxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucnVuT3V0c2lkZSA9IChjYWxsYmFjaykgPT4gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ha2UgYWxsIGV2ZW50cyBydW4gb3V0c2lkZSBBbmd1bGFyIGFzIHRoZXkgb2Z0ZW4gdHJpZ2dlciB0aGUgc2V0dXAgb2YgZXZlbnQgbGlzdGVuZXJzXG4gICAgLy8gQnkgaGF2aW5nIHRoZSBldmVudCBsaXN0ZW5lcnMgb3V0c2lkZSBBbmd1bGFyIHdlIGNhbiBhdm9pZCB0cmlnZ2VyaW5nIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAvLyBUaGlzIGFsc28gbWVhbnMgdGhhdCBpZiBhIHVzZXIgY2FsbHMgYW4gQUcgR3JpZCBBUEkgbWV0aG9kIGZyb20gd2l0aGluIHRoZWlyIGNvbXBvbmVudFxuICAgIC8vIHRoZSBpbnRlcm5hbCBzaWRlIGVmZmVjdHMgd2lsbCBub3QgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uLiBXaXRob3V0IHRoaXMgdGhlIGV2ZW50cyB3b3VsZFxuICAgIC8vIHJ1biBpbnNpZGUgQW5ndWxhciBhbmQgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIGFzIHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50IHdhcyB3aXRoaW4gdGhlIGFuZ3VsYXIgem9uZS5cbiAgICB3cmFwSW5jb21pbmc6IDxUPihjYWxsYmFjazogKCkgPT4gVCwgc291cmNlPzogRnJhbWV3b3JrT3ZlcnJpZGVzSW5jb21pbmdTb3VyY2UpID0+IFQgPSAoY2FsbGJhY2ssIHNvdXJjZSkgPT5cbiAgICAgICAgdGhpcy5ydW5PdXRzaWRlKGNhbGxiYWNrLCBzb3VyY2UpO1xuXG4gICAgLy8gT25seSBzZXR1cCB3cmFwcGluZyB3aGVuIHRoZSBjYWxsIGlzIGNvbWluZyBmcm9tIHdpdGhpbiBBbmd1bGFyIHpvbmUsIGkuZSBmcm9tIGEgdXNlcnMgYXBwbGljYXRpb24gY29kZS5cbiAgICAvLyBVc2VkIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gdXNlciBjb2RlIGFuZCBBRyBHcmlkIGNvZGUgc2V0dGluZyB1cCBldmVudHMgYWdhaW5zdCBSb3dOb2RlcyBhbmQgQ29sdW1uc1xuICAgIGdldCBzaG91bGRXcmFwT3V0Z29pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUgJiYgTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2Ugc3VyZSB0aGF0IGFueSBjb2RlIHRoYXQgaXMgZXhlY3V0ZWQgb3V0c2lkZSBvZiBBRyBHcmlkIGlzIHJ1bm5pbmcgd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAgICogVGhpcyBtZWFucyB1c2VycyBjYW4gdXBkYXRlIHRlbXBsYXRlcyBhbmQgdXNlIGJpbmRpbmcgd2l0aG91dCBoYXZpbmcgdG8gZG8gYW55dGhpbmcgZXh0cmEuXG4gICAgICovXG4gICAgd3JhcE91dGdvaW5nOiA8VD4oY2FsbGJhY2s6ICgpID0+IFQpID0+IFQgPSAoY2FsbGJhY2spID0+IHRoaXMucnVuSW5zaWRlQW5ndWxhcihjYWxsYmFjayk7XG5cbiAgICBpc0ZyYW1ld29ya0NvbXBvbmVudChjb21wOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFjb21wKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvdG90eXBlID0gY29tcC5wcm90b3R5cGU7XG4gICAgICAgIGNvbnN0IGlzQW5ndWxhckNvbXAgPSBwcm90b3R5cGUgJiYgJ2FnSW5pdCcgaW4gcHJvdG90eXBlO1xuICAgICAgICByZXR1cm4gaXNBbmd1bGFyQ29tcDtcbiAgICB9XG5cbiAgICBydW5JbnNpZGVBbmd1bGFyPFQ+KGNhbGxiYWNrOiAoKSA9PiBUKTogVCB7XG4gICAgICAgIC8vIENoZWNrIGZvciBfbmdab25lIGV4aXN0ZW5jZSBhcyBpdCBpcyBub3QgcHJlc2VudCB3aGVuIFpvbmVsZXNzXG4gICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUgPyB0aGlzLl9uZ1pvbmUucnVuKGNhbGxiYWNrKSA6IGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgcnVuT3V0c2lkZUFuZ3VsYXI8VD4oY2FsbGJhY2s6ICgpID0+IFQsIHNvdXJjZT86IEZyYW1ld29ya092ZXJyaWRlc0luY29taW5nU291cmNlKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bk91dHNpZGUoY2FsbGJhY2ssIHNvdXJjZSk7XG4gICAgfVxufVxuIl19
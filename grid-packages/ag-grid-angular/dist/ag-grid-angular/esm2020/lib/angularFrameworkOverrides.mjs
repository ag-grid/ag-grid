import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import * as i0 from "@angular/core";
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super('angular');
        this._ngZone = _ngZone;
        // Make all events run outside Angular as they often trigger the setup of event listeners
        // By having the event listeners outside Angular we can avoid triggering change detection
        // This also means that if a user calls an AG Grid API method from within their component
        // the internal side effects will not trigger change detection. Without this the events would
        // run inside Angular and trigger change detection as the source of the event was within the angular zone.
        this.wrapIncoming = (callback) => this.runOutsideAngular(callback);
        /**
         * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
         * This means users can update templates and use binding without having to do anything extra.
         */
        this.wrapOutgoing = (callback) => this.runInsideAngular(callback);
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
    runOutsideAngular(callback) {
        return this._ngZone ? this._ngZone.runOutsideAngular(callback) : callback();
    }
}
AngularFrameworkOverrides.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFrameworkOverrides.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7O0FBRzVELE1BQU0sT0FBTyx5QkFBMEIsU0FBUSx5QkFBeUI7SUFDcEUsWUFBb0IsT0FBZTtRQUMvQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFERCxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBSW5DLHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYseUZBQXlGO1FBQ3pGLDZGQUE2RjtRQUM3RiwwR0FBMEc7UUFDMUcsaUJBQVksR0FBaUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQVE1Rjs7O1dBR0c7UUFDSCxpQkFBWSxHQUFpQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBbkIzRixDQUFDO0lBU0QsMkdBQTJHO0lBQzNHLHdHQUF3RztJQUN4RyxJQUFJLGtCQUFrQjtRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFRRCxvQkFBb0IsQ0FBQyxJQUFTO1FBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsTUFBTSxhQUFhLEdBQUcsU0FBUyxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUM7UUFDekQsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVELGdCQUFnQixDQUFLLFFBQWlCO1FBQ2xDLGlFQUFpRTtRQUNqRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRSxDQUFDO0lBQ0QsaUJBQWlCLENBQUssUUFBaUI7UUFDbkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoRixDQUFDOztzSEFyQ1EseUJBQXlCOzBIQUF6Qix5QkFBeUI7MkZBQXpCLHlCQUF5QjtrQkFEckMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcignYW5ndWxhcicpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgYWxsIGV2ZW50cyBydW4gb3V0c2lkZSBBbmd1bGFyIGFzIHRoZXkgb2Z0ZW4gdHJpZ2dlciB0aGUgc2V0dXAgb2YgZXZlbnQgbGlzdGVuZXJzXG4gICAgLy8gQnkgaGF2aW5nIHRoZSBldmVudCBsaXN0ZW5lcnMgb3V0c2lkZSBBbmd1bGFyIHdlIGNhbiBhdm9pZCB0cmlnZ2VyaW5nIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAvLyBUaGlzIGFsc28gbWVhbnMgdGhhdCBpZiBhIHVzZXIgY2FsbHMgYW4gQUcgR3JpZCBBUEkgbWV0aG9kIGZyb20gd2l0aGluIHRoZWlyIGNvbXBvbmVudFxuICAgIC8vIHRoZSBpbnRlcm5hbCBzaWRlIGVmZmVjdHMgd2lsbCBub3QgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uLiBXaXRob3V0IHRoaXMgdGhlIGV2ZW50cyB3b3VsZFxuICAgIC8vIHJ1biBpbnNpZGUgQW5ndWxhciBhbmQgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIGFzIHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50IHdhcyB3aXRoaW4gdGhlIGFuZ3VsYXIgem9uZS5cbiAgICB3cmFwSW5jb21pbmc6IDxUPihjYWxsYmFjazogKCkgPT4gVCkgPT4gVCAgPSAoY2FsbGJhY2spID0+IHRoaXMucnVuT3V0c2lkZUFuZ3VsYXIoY2FsbGJhY2spO1xuXG4gICAgLy8gT25seSBzZXR1cCB3cmFwcGluZyB3aGVuIHRoZSBjYWxsIGlzIGNvbWluZyBmcm9tIHdpdGhpbiBBbmd1bGFyIHpvbmUsIGkuZSBmcm9tIGEgdXNlcnMgYXBwbGljYXRpb24gY29kZS5cbiAgICAvLyBVc2VkIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gdXNlciBjb2RlIGFuZCBBRyBHcmlkIGNvZGUgc2V0dGluZyB1cCBldmVudHMgYWdhaW5zdCBSb3dOb2RlcyBhbmQgQ29sdW1uc1xuICAgIGdldCBzaG91bGRXcmFwT3V0Z29pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUgJiYgTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpOyBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHN1cmUgdGhhdCBhbnkgY29kZSB0aGF0IGlzIGV4ZWN1dGVkIG91dHNpZGUgb2YgQUcgR3JpZCBpcyBydW5uaW5nIHdpdGhpbiB0aGUgQW5ndWxhciB6b25lLlxuICAgICAqIFRoaXMgbWVhbnMgdXNlcnMgY2FuIHVwZGF0ZSB0ZW1wbGF0ZXMgYW5kIHVzZSBiaW5kaW5nIHdpdGhvdXQgaGF2aW5nIHRvIGRvIGFueXRoaW5nIGV4dHJhLlxuICAgICAqL1xuICAgIHdyYXBPdXRnb2luZzogPFQ+KCBjYWxsYmFjazogKCkgPT4gVCkgPT4gVCA9IChjYWxsYmFjaykgPT4gdGhpcy5ydW5JbnNpZGVBbmd1bGFyKGNhbGxiYWNrKTtcblxuICAgIGlzRnJhbWV3b3JrQ29tcG9uZW50KGNvbXA6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWNvbXApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGNvbnN0IHByb3RvdHlwZSA9IGNvbXAucHJvdG90eXBlO1xuICAgICAgICBjb25zdCBpc0FuZ3VsYXJDb21wID0gcHJvdG90eXBlICYmICdhZ0luaXQnIGluIHByb3RvdHlwZTtcbiAgICAgICAgcmV0dXJuIGlzQW5ndWxhckNvbXA7XG4gICAgfVxuXG4gICAgcnVuSW5zaWRlQW5ndWxhcjxUPiggY2FsbGJhY2s6ICgpID0+IFQpOiBUIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIF9uZ1pvbmUgZXhpc3RlbmNlIGFzIGl0IGlzIG5vdCBwcmVzZW50IHdoZW4gWm9uZWxlc3NcbiAgICAgICAgcmV0dXJuIHRoaXMuX25nWm9uZSA/IHRoaXMuX25nWm9uZS5ydW4oY2FsbGJhY2spIDogY2FsbGJhY2soKTtcbiAgICB9XG4gICAgcnVuT3V0c2lkZUFuZ3VsYXI8VD4oIGNhbGxiYWNrOiAoKSA9PiBUKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZ1pvbmUgPyB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoY2FsbGJhY2spIDogY2FsbGJhY2soKTtcbiAgICB9XG59XG4iXX0=
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import { AgPromise } from "ag-grid-community";
import * as i0 from "@angular/core";
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super('angular');
        this._ngZone = _ngZone;
    }
    setEmitterUsedCallback(isEmitterUsed) {
        this.isEmitterUsed = isEmitterUsed;
    }
    setTimeout(action, timeout) {
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                window.setTimeout(() => {
                    action();
                }, timeout);
            });
        }
        else {
            window.setTimeout(() => {
                action();
            }, timeout);
        }
    }
    setInterval(action, interval) {
        return new AgPromise(resolve => {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(() => {
                    resolve(window.setInterval(() => {
                        action();
                    }, interval));
                });
            }
            else {
                resolve(window.setInterval(() => {
                    action();
                }, interval));
            }
        });
    }
    addEventListener(element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType) && this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    }
    dispatchEvent(eventType, listener, global = false) {
        if (this.isOutsideAngular(eventType)) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(listener);
            }
            else {
                listener();
            }
        }
        else if (this.isEmitterUsed(eventType) || global) {
            // only trigger off events (and potentially change detection) if actually used
            if (!NgZone.isInAngularZone() && this._ngZone) {
                this._ngZone.run(listener);
            }
            else {
                listener();
            }
        }
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }
}
AngularFrameworkOverrides.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFrameworkOverrides.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUc1QyxNQUFNLE9BQU8seUJBQTBCLFNBQVEseUJBQXlCO0lBR3BFLFlBQW9CLE9BQWU7UUFDL0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBREQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUVuQyxDQUFDO0lBRUQsc0JBQXNCLENBQUMsYUFBNkM7UUFDaEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFFdkMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxNQUFXLEVBQUUsT0FBYTtRQUN4QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ25CLE1BQU0sRUFBRSxDQUFDO2dCQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbkIsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFTSxXQUFXLENBQUMsTUFBVyxFQUFFLFFBQWM7UUFDMUMsT0FBTyxJQUFJLFNBQVMsQ0FBUyxPQUFPLENBQUMsRUFBRTtZQUNuQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0JBQ2hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTt3QkFDeEIsTUFBTSxFQUFFLENBQUM7b0JBQ2IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUNmLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLENBQUM7YUFDTjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7b0JBQ3hCLE1BQU0sRUFBRSxDQUFDO2dCQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FDZixDQUFDO2FBQ0w7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFvQixFQUFFLFNBQWlCLEVBQUUsUUFBNkMsRUFBRSxVQUFvQjtRQUN6SCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM3RDtJQUNMLENBQUM7SUFFRCxhQUFhLENBQUMsU0FBaUIsRUFBRSxRQUFrQixFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQy9ELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILFFBQVEsRUFBRSxDQUFDO2FBQ2Q7U0FDSjthQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDaEQsOEVBQThFO1lBQzlFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0gsUUFBUSxFQUFFLENBQUM7YUFDZDtTQUNKO0lBQ0wsQ0FBQztJQUVELG9CQUFvQixDQUFDLElBQVM7UUFDMUIsSUFBSSxDQUFDLElBQUksRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1NBQUU7UUFDNUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxNQUFNLGFBQWEsR0FBRyxTQUFTLElBQUksUUFBUSxJQUFJLFNBQVMsQ0FBQztRQUN6RCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDOztzSEE1RVEseUJBQXlCOzBIQUF6Qix5QkFBeUI7MkZBQXpCLHlCQUF5QjtrQkFEckMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbmltcG9ydCB7QWdQcm9taXNlfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICBwcml2YXRlIGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7XG4gICAgICAgIHN1cGVyKCdhbmd1bGFyJyk7XG4gICAgfVxuXG4gICAgc2V0RW1pdHRlclVzZWRDYWxsYmFjayhpc0VtaXR0ZXJVc2VkOiAoZXZlbnRUeXBlOiBzdHJpbmcpID0+IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pc0VtaXR0ZXJVc2VkID0gaXNFbWl0dGVyVXNlZDtcblxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUaW1lb3V0KGFjdGlvbjogYW55LCB0aW1lb3V0PzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJ2YWwoYWN0aW9uOiBhbnksIGludGVydmFsPzogYW55KTogQWdQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IEFnUHJvbWlzZTxudW1iZXI+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyIHwgRXZlbnRMaXN0ZW5lck9iamVjdCwgdXNlQ2FwdHVyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpICYmIHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiAoKSA9PiB7fSwgZ2xvYmFsID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSB8fCBnbG9iYWwpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBvZmYgZXZlbnRzIChhbmQgcG90ZW50aWFsbHkgY2hhbmdlIGRldGVjdGlvbikgaWYgYWN0dWFsbHkgdXNlZFxuICAgICAgICAgICAgaWYgKCFOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgJiYgdGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0ZyYW1ld29ya0NvbXBvbmVudChjb21wOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFjb21wKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICBjb25zdCBwcm90b3R5cGUgPSBjb21wLnByb3RvdHlwZTtcbiAgICAgICAgY29uc3QgaXNBbmd1bGFyQ29tcCA9IHByb3RvdHlwZSAmJiAnYWdJbml0JyBpbiBwcm90b3R5cGU7XG4gICAgICAgIHJldHVybiBpc0FuZ3VsYXJDb21wO1xuICAgIH1cbn1cbiJdfQ==
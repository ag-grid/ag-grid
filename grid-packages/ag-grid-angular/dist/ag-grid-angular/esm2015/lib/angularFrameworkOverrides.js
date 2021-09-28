import { __decorate, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import { AgPromise } from "ag-grid-community";
let AngularFrameworkOverrides = class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super();
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
};
AngularFrameworkOverrides.ctorParameters = () => [
    { type: NgZone }
];
AngularFrameworkOverrides = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [NgZone])
], AngularFrameworkOverrides);
export { AngularFrameworkOverrides };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHNUMsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBMEIsU0FBUSx5QkFBeUI7SUFHcEUsWUFBb0IsT0FBZTtRQUMvQixLQUFLLEVBQUUsQ0FBQztRQURRLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFFbkMsQ0FBQztJQUVELHNCQUFzQixDQUFDLGFBQTZDO1FBQ2hFLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBRXZDLENBQUM7SUFFTSxVQUFVLENBQUMsTUFBVyxFQUFFLE9BQWE7UUFDeEMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNuQixNQUFNLEVBQUUsQ0FBQztnQkFDYixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ25CLE1BQU0sRUFBRSxDQUFDO1lBQ2IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRU0sV0FBVyxDQUFDLE1BQVcsRUFBRSxRQUFjO1FBQzFDLE9BQU8sSUFBSSxTQUFTLENBQVMsT0FBTyxDQUFDLEVBQUU7WUFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO29CQUNoQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7d0JBQ3hCLE1BQU0sRUFBRSxDQUFDO29CQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FDZixDQUFDO2dCQUNOLENBQUMsQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO29CQUN4QixNQUFNLEVBQUUsQ0FBQztnQkFDYixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQ2YsQ0FBQzthQUNMO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsT0FBb0IsRUFBRSxTQUFpQixFQUFFLFFBQTZDLEVBQUUsVUFBb0I7UUFDekgsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDaEMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDN0Q7SUFDTCxDQUFDO0lBRUQsYUFBYSxDQUFDLFNBQWlCLEVBQUUsUUFBa0IsRUFBRSxNQUFNLEdBQUcsS0FBSztRQUMvRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDSCxRQUFRLEVBQUUsQ0FBQzthQUNkO1NBQ0o7YUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ2hELDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNILFFBQVEsRUFBRSxDQUFDO2FBQ2Q7U0FDSjtJQUNMLENBQUM7Q0FDSixDQUFBOztZQW5FZ0MsTUFBTTs7QUFIMUIseUJBQXlCO0lBRHJDLFVBQVUsRUFBRTtxQ0FJb0IsTUFBTTtHQUgxQix5QkFBeUIsQ0FzRXJDO1NBdEVZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbmltcG9ydCB7QWdQcm9taXNlfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICBwcml2YXRlIGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgc2V0RW1pdHRlclVzZWRDYWxsYmFjayhpc0VtaXR0ZXJVc2VkOiAoZXZlbnRUeXBlOiBzdHJpbmcpID0+IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pc0VtaXR0ZXJVc2VkID0gaXNFbWl0dGVyVXNlZDtcblxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUaW1lb3V0KGFjdGlvbjogYW55LCB0aW1lb3V0PzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SW50ZXJ2YWwoYWN0aW9uOiBhbnksIGludGVydmFsPzogYW55KTogQWdQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IEFnUHJvbWlzZTxudW1iZXI+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyIHwgRXZlbnRMaXN0ZW5lck9iamVjdCwgdXNlQ2FwdHVyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpICYmIHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiAoKSA9PiB7fSwgZ2xvYmFsID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSB8fCBnbG9iYWwpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBvZmYgZXZlbnRzIChhbmQgcG90ZW50aWFsbHkgY2hhbmdlIGRldGVjdGlvbikgaWYgYWN0dWFsbHkgdXNlZFxuICAgICAgICAgICAgaWYgKCFOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgJiYgdGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
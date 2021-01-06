import { __decorate, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
let AngularFrameworkOverrides = class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super();
        this._ngZone = _ngZone;
    }
    setEmitterUsedCallback(isEmitterUsed) {
        this.isEmitterUsed = isEmitterUsed;
    }
    setTimeout(action, timeout) {
        this._ngZone.runOutsideAngular(() => {
            window.setTimeout(() => {
                action();
            }, timeout);
        });
    }
    addEventListener(element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType)) {
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    }
    dispatchEvent(eventType, listener) {
        if (this.isOutsideAngular(eventType)) {
            this._ngZone.runOutsideAngular(listener);
        }
        else if (this.isEmitterUsed(eventType)) {
            // only trigger off events (and potentially change detection) if actually used
            if (!NgZone.isInAngularZone()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUc1RCxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUEwQixTQUFRLHlCQUF5QjtJQUdwRSxZQUFvQixPQUFlO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBRFEsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUVuQyxDQUFDO0lBRUQsc0JBQXNCLENBQUMsYUFBNkM7UUFDaEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFFdkMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxNQUFXLEVBQUUsT0FBYTtRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbkIsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsT0FBb0IsRUFBRSxTQUFpQixFQUFFLFFBQTZDLEVBQUUsVUFBb0I7UUFDekgsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzdEO0lBQ0wsQ0FBQztJQUVELGFBQWEsQ0FBQyxTQUFpQixFQUFFLFFBQWtCO1FBQy9DLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUM7YUFBTSxJQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDckMsOEVBQThFO1lBQzlFLElBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNILFFBQVEsRUFBRSxDQUFDO2FBQ2Q7U0FDSjtJQUNMLENBQUM7Q0FDSixDQUFBOztZQXZDZ0MsTUFBTTs7QUFIMUIseUJBQXlCO0lBRHJDLFVBQVUsRUFBRTtxQ0FJb0IsTUFBTTtHQUgxQix5QkFBeUIsQ0EwQ3JDO1NBMUNZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICBwcml2YXRlIGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgc2V0RW1pdHRlclVzZWRDYWxsYmFjayhpc0VtaXR0ZXJVc2VkOiAoZXZlbnRUeXBlOiBzdHJpbmcpID0+IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pc0VtaXR0ZXJVc2VkID0gaXNFbWl0dGVyVXNlZDtcblxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUaW1lb3V0KGFjdGlvbjogYW55LCB0aW1lb3V0PzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyIHwgRXZlbnRMaXN0ZW5lck9iamVjdCwgdXNlQ2FwdHVyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudChldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6ICgpID0+IHt9KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzT3V0c2lkZUFuZ3VsYXIoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGxpc3RlbmVyKTtcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgb2ZmIGV2ZW50cyAoYW5kIHBvdGVudGlhbGx5IGNoYW5nZSBkZXRlY3Rpb24pIGlmIGFjdHVhbGx5IHVzZWRcbiAgICAgICAgICAgIGlmKCFOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
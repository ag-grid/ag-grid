import { __decorate } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
let AngularFrameworkOverrides = class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super();
        this._ngZone = _ngZone;
    }
    setTimeout(action, timeout) {
        this._ngZone.runOutsideAngular(() => {
            window.setTimeout(() => {
                action();
            }, timeout);
        });
    }
    addEventListenerOutsideAngular(element, type, listener, useCapture) {
        this._ngZone.runOutsideAngular(() => {
            super.addEventListenerOutsideAngular(element, type, listener, useCapture);
        });
    }
};
AngularFrameworkOverrides.ctorParameters = () => [
    { type: NgZone }
];
AngularFrameworkOverrides = __decorate([
    Injectable()
], AngularFrameworkOverrides);
export { AngularFrameworkOverrides };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUc1RCxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUEwQixTQUFRLHlCQUF5QjtJQUNwRSxZQUFvQixPQUFlO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBRFEsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUVuQyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQVcsRUFBRSxPQUFhO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNuQixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCw4QkFBOEIsQ0FBQyxPQUFvQixFQUFFLElBQVksRUFBRSxRQUE2QyxFQUFFLFVBQW9CO1FBQ2xJLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2hDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBOztZQWpCZ0MsTUFBTTs7QUFEMUIseUJBQXlCO0lBRHJDLFVBQVUsRUFBRTtHQUNBLHlCQUF5QixDQWtCckM7U0FsQlkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyBleHRlbmRzIFZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFRpbWVvdXQoYWN0aW9uOiBhbnksIHRpbWVvdXQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyT3V0c2lkZUFuZ3VsYXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXIgfCBFdmVudExpc3RlbmVyT2JqZWN0LCB1c2VDYXB0dXJlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgc3VwZXIuYWRkRXZlbnRMaXN0ZW5lck91dHNpZGVBbmd1bGFyKGVsZW1lbnQsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
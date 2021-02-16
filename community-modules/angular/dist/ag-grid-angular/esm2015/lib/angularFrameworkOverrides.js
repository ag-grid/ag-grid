import { __decorate, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBR2xFLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQTBCLFNBQVEseUJBQXlCO0lBR3BFLFlBQW9CLE9BQWU7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFEUSxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBRW5DLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxhQUE2QztRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUV2QyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQVcsRUFBRSxPQUFhO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNuQixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxPQUFvQixFQUFFLFNBQWlCLEVBQUUsUUFBNkMsRUFBRSxVQUFvQjtRQUN6SCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDaEMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDN0Q7SUFDTCxDQUFDO0lBRUQsYUFBYSxDQUFDLFNBQWlCLEVBQUUsUUFBa0I7UUFDL0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1QzthQUFNLElBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNyQyw4RUFBOEU7WUFDOUUsSUFBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0gsUUFBUSxFQUFFLENBQUM7YUFDZDtTQUNKO0lBQ0wsQ0FBQztDQUNKLENBQUE7O1lBdkNnQyxNQUFNOztBQUgxQix5QkFBeUI7SUFEckMsVUFBVSxFQUFFO3FDQUlvQixNQUFNO0dBSDFCLHlCQUF5QixDQTBDckM7U0ExQ1kseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyBleHRlbmRzIFZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMge1xuICAgIHByaXZhdGUgaXNFbWl0dGVyVXNlZDogKGV2ZW50VHlwZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBzZXRFbWl0dGVyVXNlZENhbGxiYWNrKGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbikge1xuICAgICAgICB0aGlzLmlzRW1pdHRlclVzZWQgPSBpc0VtaXR0ZXJVc2VkO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHNldFRpbWVvdXQoYWN0aW9uOiBhbnksIHRpbWVvdXQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXIgfCBFdmVudExpc3RlbmVyT2JqZWN0LCB1c2VDYXB0dXJlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogKCkgPT4ge30pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRzaWRlQW5ndWxhcihldmVudFR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIobGlzdGVuZXIpO1xuICAgICAgICB9IGVsc2UgaWYodGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgdHJpZ2dlciBvZmYgZXZlbnRzIChhbmQgcG90ZW50aWFsbHkgY2hhbmdlIGRldGVjdGlvbikgaWYgYWN0dWFsbHkgdXNlZFxuICAgICAgICAgICAgaWYoIU5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4obGlzdGVuZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19
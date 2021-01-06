import { __decorate, __extends, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
var AngularFrameworkOverrides = /** @class */ (function (_super) {
    __extends(AngularFrameworkOverrides, _super);
    function AngularFrameworkOverrides(_ngZone) {
        var _this = _super.call(this) || this;
        _this._ngZone = _ngZone;
        return _this;
    }
    AngularFrameworkOverrides.prototype.setEmitterUsedCallback = function (isEmitterUsed) {
        this.isEmitterUsed = isEmitterUsed;
    };
    AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        this._ngZone.runOutsideAngular(function () {
            window.setTimeout(function () {
                action();
            }, timeout);
        });
    };
    AngularFrameworkOverrides.prototype.addEventListener = function (element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType)) {
            this._ngZone.runOutsideAngular(function () {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    };
    AngularFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener) {
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
    };
    AngularFrameworkOverrides.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    AngularFrameworkOverrides = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NgZone])
    ], AngularFrameworkOverrides);
    return AngularFrameworkOverrides;
}(VanillaFrameworkOverrides));
export { AngularFrameworkOverrides };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBR2xFO0lBQStDLDZDQUF5QjtJQUdwRSxtQ0FBb0IsT0FBZTtRQUFuQyxZQUNJLGlCQUFPLFNBQ1Y7UUFGbUIsYUFBTyxHQUFQLE9BQU8sQ0FBUTs7SUFFbkMsQ0FBQztJQUVELDBEQUFzQixHQUF0QixVQUF1QixhQUE2QztRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUV2QyxDQUFDO0lBRU0sOENBQVUsR0FBakIsVUFBa0IsTUFBVyxFQUFFLE9BQWE7UUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztZQUMzQixNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUNkLE1BQU0sRUFBRSxDQUFDO1lBQ2IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG9EQUFnQixHQUFoQixVQUFpQixPQUFvQixFQUFFLFNBQWlCLEVBQUUsUUFBNkMsRUFBRSxVQUFvQjtRQUN6SCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUMzQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM3RDtJQUNMLENBQUM7SUFFRCxpREFBYSxHQUFiLFVBQWMsU0FBaUIsRUFBRSxRQUFrQjtRQUMvQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVDO2FBQU0sSUFBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3JDLDhFQUE4RTtZQUM5RSxJQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFO2dCQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtpQkFBTTtnQkFDSCxRQUFRLEVBQUUsQ0FBQzthQUNkO1NBQ0o7SUFDTCxDQUFDOztnQkF0QzRCLE1BQU07O0lBSDFCLHlCQUF5QjtRQURyQyxVQUFVLEVBQUU7eUNBSW9CLE1BQU07T0FIMUIseUJBQXlCLENBMENyQztJQUFELGdDQUFDO0NBQUEsQUExQ0QsQ0FBK0MseUJBQXlCLEdBMEN2RTtTQTFDWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7VmFuaWxsYUZyYW1ld29ya092ZXJyaWRlc30gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIGV4dGVuZHMgVmFuaWxsYUZyYW1ld29ya092ZXJyaWRlcyB7XG4gICAgcHJpdmF0ZSBpc0VtaXR0ZXJVc2VkOiAoZXZlbnRUeXBlOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHNldEVtaXR0ZXJVc2VkQ2FsbGJhY2soaXNFbWl0dGVyVXNlZDogKGV2ZW50VHlwZTogc3RyaW5nKSA9PiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaXNFbWl0dGVyVXNlZCA9IGlzRW1pdHRlclVzZWQ7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VGltZW91dChhY3Rpb246IGFueSwgdGltZW91dD86IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50VHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lciB8IEV2ZW50TGlzdGVuZXJPYmplY3QsIHVzZUNhcHR1cmU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzT3V0c2lkZUFuZ3VsYXIoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihsaXN0ZW5lcik7XG4gICAgICAgIH0gZWxzZSBpZih0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyIG9mZiBldmVudHMgKGFuZCBwb3RlbnRpYWxseSBjaGFuZ2UgZGV0ZWN0aW9uKSBpZiBhY3R1YWxseSB1c2VkXG4gICAgICAgICAgICBpZighTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
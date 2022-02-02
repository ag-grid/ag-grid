import { __decorate, __extends, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
import { AgPromise } from "@ag-grid-community/core";
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
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(function () {
                window.setTimeout(function () {
                    action();
                }, timeout);
            });
        }
        else {
            window.setTimeout(function () {
                action();
            }, timeout);
        }
    };
    AngularFrameworkOverrides.prototype.setInterval = function (action, interval) {
        var _this = this;
        return new AgPromise(function (resolve) {
            if (_this._ngZone) {
                _this._ngZone.runOutsideAngular(function () {
                    resolve(window.setInterval(function () {
                        action();
                    }, interval));
                });
            }
            else {
                resolve(window.setInterval(function () {
                    action();
                }, interval));
            }
        });
    };
    AngularFrameworkOverrides.prototype.addEventListener = function (element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType) && this._ngZone) {
            this._ngZone.runOutsideAngular(function () {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    };
    AngularFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
        if (global === void 0) { global = false; }
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
    };
    AngularFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
        if (!comp) {
            return false;
        }
        var prototype = comp.prototype;
        var isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUdsRDtJQUErQyw2Q0FBeUI7SUFHcEUsbUNBQW9CLE9BQWU7UUFBbkMsWUFDSSxpQkFBTyxTQUNWO1FBRm1CLGFBQU8sR0FBUCxPQUFPLENBQVE7O0lBRW5DLENBQUM7SUFFRCwwREFBc0IsR0FBdEIsVUFBdUIsYUFBNkM7UUFDaEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFFdkMsQ0FBQztJQUVNLDhDQUFVLEdBQWpCLFVBQWtCLE1BQVcsRUFBRSxPQUFhO1FBQ3hDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxVQUFVLENBQUM7b0JBQ2QsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ2QsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFTSwrQ0FBVyxHQUFsQixVQUFtQixNQUFXLEVBQUUsUUFBYztRQUE5QyxpQkFnQkM7UUFmRyxPQUFPLElBQUksU0FBUyxDQUFTLFVBQUEsT0FBTztZQUNoQyxJQUFJLEtBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsS0FBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztvQkFDM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7d0JBQ25CLE1BQU0sRUFBRSxDQUFDO29CQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FDZixDQUFDO2dCQUNOLENBQUMsQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7b0JBQ25CLE1BQU0sRUFBRSxDQUFDO2dCQUNiLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FDZixDQUFDO2FBQ0w7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxvREFBZ0IsR0FBaEIsVUFBaUIsT0FBb0IsRUFBRSxTQUFpQixFQUFFLFFBQTZDLEVBQUUsVUFBb0I7UUFDekgsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUMzQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM3RDtJQUNMLENBQUM7SUFFRCxpREFBYSxHQUFiLFVBQWMsU0FBaUIsRUFBRSxRQUFrQixFQUFFLE1BQWM7UUFBZCx1QkFBQSxFQUFBLGNBQWM7UUFDL0QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsUUFBUSxFQUFFLENBQUM7YUFDZDtTQUNKO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUNoRCw4RUFBOEU7WUFDOUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtpQkFBTTtnQkFDSCxRQUFRLEVBQUUsQ0FBQzthQUNkO1NBQ0o7SUFDTCxDQUFDO0lBRUQsd0RBQW9CLEdBQXBCLFVBQXFCLElBQVM7UUFDMUIsSUFBSSxDQUFDLElBQUksRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1NBQUU7UUFDNUIsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFNLGFBQWEsR0FBRyxTQUFTLElBQUksUUFBUSxJQUFJLFNBQVMsQ0FBQztRQUN6RCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDOztnQkF6RTRCLE1BQU07O0lBSDFCLHlCQUF5QjtRQURyQyxVQUFVLEVBQUU7eUNBSW9CLE1BQU07T0FIMUIseUJBQXlCLENBNkVyQztJQUFELGdDQUFDO0NBQUEsQUE3RUQsQ0FBK0MseUJBQXlCLEdBNkV2RTtTQTdFWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7VmFuaWxsYUZyYW1ld29ya092ZXJyaWRlc30gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5pbXBvcnQge0FnUHJvbWlzZX0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIGV4dGVuZHMgVmFuaWxsYUZyYW1ld29ya092ZXJyaWRlcyB7XG4gICAgcHJpdmF0ZSBpc0VtaXR0ZXJVc2VkOiAoZXZlbnRUeXBlOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHNldEVtaXR0ZXJVc2VkQ2FsbGJhY2soaXNFbWl0dGVyVXNlZDogKGV2ZW50VHlwZTogc3RyaW5nKSA9PiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuaXNFbWl0dGVyVXNlZCA9IGlzRW1pdHRlclVzZWQ7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VGltZW91dChhY3Rpb246IGFueSwgdGltZW91dD86IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldEludGVydmFsKGFjdGlvbjogYW55LCBpbnRlcnZhbD86IGFueSk6IEFnUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBBZ1Byb21pc2U8bnVtYmVyPihyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50VHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lciB8IEV2ZW50TGlzdGVuZXJPYmplY3QsIHVzZUNhcHR1cmU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzT3V0c2lkZUFuZ3VsYXIoZXZlbnRUeXBlKSAmJiB0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogKCkgPT4ge30sIGdsb2JhbCA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzT3V0c2lkZUFuZ3VsYXIoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkgfHwgZ2xvYmFsKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgb2ZmIGV2ZW50cyAoYW5kIHBvdGVudGlhbGx5IGNoYW5nZSBkZXRlY3Rpb24pIGlmIGFjdHVhbGx5IHVzZWRcbiAgICAgICAgICAgIGlmICghTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpICYmIHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4obGlzdGVuZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNGcmFtZXdvcmtDb21wb25lbnQoY29tcDogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghY29tcCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgY29uc3QgcHJvdG90eXBlID0gY29tcC5wcm90b3R5cGU7XG4gICAgICAgIGNvbnN0IGlzQW5ndWxhckNvbXAgPSBwcm90b3R5cGUgJiYgJ2FnSW5pdCcgaW4gcHJvdG90eXBlO1xuICAgICAgICByZXR1cm4gaXNBbmd1bGFyQ29tcDtcbiAgICB9XG59XG4iXX0=
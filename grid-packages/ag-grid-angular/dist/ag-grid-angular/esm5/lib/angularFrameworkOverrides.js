import { __decorate, __extends, __metadata } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import { AgPromise } from "ag-grid-community";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHNUM7SUFBK0MsNkNBQXlCO0lBR3BFLG1DQUFvQixPQUFlO1FBQW5DLFlBQ0ksaUJBQU8sU0FDVjtRQUZtQixhQUFPLEdBQVAsT0FBTyxDQUFROztJQUVuQyxDQUFDO0lBRUQsMERBQXNCLEdBQXRCLFVBQXVCLGFBQTZDO1FBQ2hFLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBRXZDLENBQUM7SUFFTSw4Q0FBVSxHQUFqQixVQUFrQixNQUFXLEVBQUUsT0FBYTtRQUN4QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUMzQixNQUFNLENBQUMsVUFBVSxDQUFDO29CQUNkLE1BQU0sRUFBRSxDQUFDO2dCQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUNkLE1BQU0sRUFBRSxDQUFDO1lBQ2IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRU0sK0NBQVcsR0FBbEIsVUFBbUIsTUFBVyxFQUFFLFFBQWM7UUFBOUMsaUJBZ0JDO1FBZkcsT0FBTyxJQUFJLFNBQVMsQ0FBUyxVQUFBLE9BQU87WUFDaEMsSUFBSSxLQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNkLEtBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7b0JBQzNCLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO3dCQUNuQixNQUFNLEVBQUUsQ0FBQztvQkFDYixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQ2YsQ0FBQztnQkFDTixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO29CQUNuQixNQUFNLEVBQUUsQ0FBQztnQkFDYixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQ2YsQ0FBQzthQUNMO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsb0RBQWdCLEdBQWhCLFVBQWlCLE9BQW9CLEVBQUUsU0FBaUIsRUFBRSxRQUE2QyxFQUFFLFVBQW9CO1FBQ3pILElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDN0Q7SUFDTCxDQUFDO0lBRUQsaURBQWEsR0FBYixVQUFjLFNBQWlCLEVBQUUsUUFBa0IsRUFBRSxNQUFjO1FBQWQsdUJBQUEsRUFBQSxjQUFjO1FBQy9ELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILFFBQVEsRUFBRSxDQUFDO2FBQ2Q7U0FDSjthQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDaEQsOEVBQThFO1lBQzlFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0gsUUFBUSxFQUFFLENBQUM7YUFDZDtTQUNKO0lBQ0wsQ0FBQzs7Z0JBbEU0QixNQUFNOztJQUgxQix5QkFBeUI7UUFEckMsVUFBVSxFQUFFO3lDQUlvQixNQUFNO09BSDFCLHlCQUF5QixDQXNFckM7SUFBRCxnQ0FBQztDQUFBLEFBdEVELENBQStDLHlCQUF5QixHQXNFdkU7U0F0RVkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuaW1wb3J0IHtBZ1Byb21pc2V9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyBleHRlbmRzIFZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMge1xuICAgIHByaXZhdGUgaXNFbWl0dGVyVXNlZDogKGV2ZW50VHlwZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBzZXRFbWl0dGVyVXNlZENhbGxiYWNrKGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbikge1xuICAgICAgICB0aGlzLmlzRW1pdHRlclVzZWQgPSBpc0VtaXR0ZXJVc2VkO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHNldFRpbWVvdXQoYWN0aW9uOiBhbnksIHRpbWVvdXQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcnZhbChhY3Rpb246IGFueSwgaW50ZXJ2YWw/OiBhbnkpOiBBZ1Byb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgQWdQcm9taXNlPG51bWJlcj4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXIgfCBFdmVudExpc3RlbmVyT2JqZWN0LCB1c2VDYXB0dXJlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkgJiYgdGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudChldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6ICgpID0+IHt9LCBnbG9iYWwgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpIHx8IGdsb2JhbCkge1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyIG9mZiBldmVudHMgKGFuZCBwb3RlbnRpYWxseSBjaGFuZ2UgZGV0ZWN0aW9uKSBpZiBhY3R1YWxseSB1c2VkXG4gICAgICAgICAgICBpZiAoIU5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSAmJiB0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
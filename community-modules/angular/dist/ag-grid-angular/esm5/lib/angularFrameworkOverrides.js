import { __decorate, __extends } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
var AngularFrameworkOverrides = /** @class */ (function (_super) {
    __extends(AngularFrameworkOverrides, _super);
    function AngularFrameworkOverrides(_ngZone) {
        var _this = _super.call(this) || this;
        _this._ngZone = _ngZone;
        return _this;
    }
    AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        this._ngZone.runOutsideAngular(function () {
            window.setTimeout(function () {
                action();
            }, timeout);
        });
    };
    AngularFrameworkOverrides.prototype.addEventListenerOutsideAngular = function (element, type, listener, useCapture) {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _super.prototype.addEventListenerOutsideAngular.call(_this, element, type, listener, useCapture);
        });
    };
    AngularFrameworkOverrides.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    AngularFrameworkOverrides = __decorate([
        Injectable()
    ], AngularFrameworkOverrides);
    return AngularFrameworkOverrides;
}(VanillaFrameworkOverrides));
export { AngularFrameworkOverrides };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBR2xFO0lBQStDLDZDQUF5QjtJQUNwRSxtQ0FBb0IsT0FBZTtRQUFuQyxZQUNJLGlCQUFPLFNBQ1Y7UUFGbUIsYUFBTyxHQUFQLE9BQU8sQ0FBUTs7SUFFbkMsQ0FBQztJQUVNLDhDQUFVLEdBQWpCLFVBQWtCLE1BQVcsRUFBRSxPQUFhO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDM0IsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDZCxNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxrRUFBOEIsR0FBOUIsVUFBK0IsT0FBb0IsRUFBRSxJQUFZLEVBQUUsUUFBNkMsRUFBRSxVQUFvQjtRQUF0SSxpQkFJQztRQUhHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDM0IsaUJBQU0sOEJBQThCLGFBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOztnQkFoQjRCLE1BQU07O0lBRDFCLHlCQUF5QjtRQURyQyxVQUFVLEVBQUU7T0FDQSx5QkFBeUIsQ0FrQnJDO0lBQUQsZ0NBQUM7Q0FBQSxBQWxCRCxDQUErQyx5QkFBeUIsR0FrQnZFO1NBbEJZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzfSBmcm9tIFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgZXh0ZW5kcyBWYW5pbGxhRnJhbWV3b3JrT3ZlcnJpZGVzIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUaW1lb3V0KGFjdGlvbjogYW55LCB0aW1lb3V0PzogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lck91dHNpZGVBbmd1bGFyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyIHwgRXZlbnRMaXN0ZW5lck9iamVjdCwgdXNlQ2FwdHVyZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHN1cGVyLmFkZEV2ZW50TGlzdGVuZXJPdXRzaWRlQW5ndWxhcihlbGVtZW50LCB0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
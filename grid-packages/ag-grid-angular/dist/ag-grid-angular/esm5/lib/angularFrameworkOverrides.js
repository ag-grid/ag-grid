import { __decorate, __extends } from "tslib";
import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUc1RDtJQUErQyw2Q0FBeUI7SUFDcEUsbUNBQW9CLE9BQWU7UUFBbkMsWUFDSSxpQkFBTyxTQUNWO1FBRm1CLGFBQU8sR0FBUCxPQUFPLENBQVE7O0lBRW5DLENBQUM7SUFFTSw4Q0FBVSxHQUFqQixVQUFrQixNQUFXLEVBQUUsT0FBYTtRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1lBQzNCLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ2QsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsa0VBQThCLEdBQTlCLFVBQStCLE9BQW9CLEVBQUUsSUFBWSxFQUFFLFFBQTZDLEVBQUUsVUFBb0I7UUFBdEksaUJBSUM7UUFIRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1lBQzNCLGlCQUFNLDhCQUE4QixhQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Z0JBaEI0QixNQUFNOztJQUQxQix5QkFBeUI7UUFEckMsVUFBVSxFQUFFO09BQ0EseUJBQXlCLENBa0JyQztJQUFELGdDQUFDO0NBQUEsQUFsQkQsQ0FBK0MseUJBQXlCLEdBa0J2RTtTQWxCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIE5nWm9uZX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7VmFuaWxsYUZyYW1ld29ya092ZXJyaWRlc30gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIGV4dGVuZHMgVmFuaWxsYUZyYW1ld29ya092ZXJyaWRlcyB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VGltZW91dChhY3Rpb246IGFueSwgdGltZW91dD86IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXJPdXRzaWRlQW5ndWxhcihlbGVtZW50OiBIVE1MRWxlbWVudCwgdHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lciB8IEV2ZW50TGlzdGVuZXJPYmplY3QsIHVzZUNhcHR1cmU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBzdXBlci5hZGRFdmVudExpc3RlbmVyT3V0c2lkZUFuZ3VsYXIoZWxlbWVudCwgdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=
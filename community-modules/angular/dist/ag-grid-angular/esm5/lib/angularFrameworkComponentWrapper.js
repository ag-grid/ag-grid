import { __decorate, __extends } from "tslib";
import { Injectable } from "@angular/core";
import { BaseComponentWrapper } from '@ag-grid-community/core';
var AngularFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(AngularFrameworkComponentWrapper, _super);
    function AngularFrameworkComponentWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AngularFrameworkComponentWrapper.prototype.setViewContainerRef = function (viewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    };
    AngularFrameworkComponentWrapper.prototype.setComponentFactoryResolver = function (componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
    };
    AngularFrameworkComponentWrapper.prototype.createWrapper = function (OriginalConstructor) {
        var that = this;
        var DynamicAgNg2Component = /** @class */ (function (_super) {
            __extends(DynamicAgNg2Component, _super);
            function DynamicAgNg2Component() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DynamicAgNg2Component.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            DynamicAgNg2Component.prototype.createComponent = function () {
                return that.createComponent(OriginalConstructor);
            };
            DynamicAgNg2Component.prototype.hasMethod = function (name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            };
            DynamicAgNg2Component.prototype.callMethod = function (name, args) {
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
            };
            DynamicAgNg2Component.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            return DynamicAgNg2Component;
        }(BaseGuiComponent));
        var wrapper = new DynamicAgNg2Component();
        return wrapper;
    };
    AngularFrameworkComponentWrapper.prototype.createComponent = function (componentType) {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        var factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        return this.viewContainerRef.createComponent(factory);
    };
    AngularFrameworkComponentWrapper = __decorate([
        Injectable()
    ], AngularFrameworkComponentWrapper);
    return AngularFrameworkComponentWrapper;
}(BaseComponentWrapper));
export { AngularFrameworkComponentWrapper };
var BaseGuiComponent = /** @class */ (function () {
    function BaseGuiComponent() {
    }
    BaseGuiComponent.prototype.init = function (params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        this._agAwareComponent.agInit(this._params);
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._eGui;
    };
    BaseGuiComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYWctZ3JpZC1jb21tdW5pdHkvYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUF5QyxVQUFVLEVBQW1CLE1BQU0sZUFBZSxDQUFDO0FBQ25HLE9BQU8sRUFBQyxvQkFBb0IsRUFBZ0QsTUFBTSx5QkFBeUIsQ0FBQztBQUk1RztJQUFzRCxvREFBd0M7SUFBOUY7O0lBbURBLENBQUM7SUEvQ1UsOERBQW1CLEdBQTFCLFVBQTJCLGdCQUFrQztRQUN6RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFDN0MsQ0FBQztJQUVNLHNFQUEyQixHQUFsQyxVQUFtQyx3QkFBa0Q7UUFDakYsSUFBSSxDQUFDLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0lBQzdELENBQUM7SUFFRCx3REFBYSxHQUFiLFVBQWMsbUJBQW1DO1FBQzdDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQjtZQUFvQyx5Q0FBZ0Q7WUFBcEY7O1lBdUJBLENBQUM7WUF0Qkcsb0NBQUksR0FBSixVQUFLLE1BQVc7Z0JBQ1osaUJBQU0sSUFBSSxZQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pELENBQUM7WUFFUywrQ0FBZSxHQUF6QjtnQkFDSSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQseUNBQVMsR0FBVCxVQUFVLElBQVk7Z0JBQ2xCLE9BQU8sT0FBTyxDQUFDLDZCQUE2QixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2pFLENBQUM7WUFFRCwwQ0FBVSxHQUFWLFVBQVcsSUFBWSxFQUFFLElBQWdCO2dCQUNyQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDMUQsT0FBTyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBRWxGLENBQUM7WUFFRCx5Q0FBUyxHQUFULFVBQVUsSUFBWSxFQUFFLFFBQWtCO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFBO1lBQzVCLENBQUM7WUFDTCw0QkFBQztRQUFELENBQUMsQUF2QkQsQ0FBb0MsZ0JBQWdCLEdBdUJuRDtRQUVELElBQUksT0FBTyxHQUEwQixJQUFJLHFCQUFxQixFQUFFLENBQUM7UUFDakUsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLDBEQUFlLEdBQXRCLFVBQTBCLGFBQTBDO1FBQ2hFLDRHQUE0RztRQUM1Ryx5R0FBeUc7UUFDekcsMERBQTBEO1FBQzFELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQWxEUSxnQ0FBZ0M7UUFENUMsVUFBVSxFQUFFO09BQ0EsZ0NBQWdDLENBbUQ1QztJQUFELHVDQUFDO0NBQUEsQUFuREQsQ0FBc0Qsb0JBQW9CLEdBbUR6RTtTQW5EWSxnQ0FBZ0M7QUFxRDdDO0lBQUE7SUFpQ0EsQ0FBQztJQTFCYSwrQkFBSSxHQUFkLFVBQWUsTUFBUztRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDckQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQy9ELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO1FBRXZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSxpQ0FBTSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFTSxrQ0FBTyxHQUFkO1FBQ0ksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRU0sd0RBQTZCLEdBQXBDO1FBQ0ksT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUM7SUFDNUMsQ0FBQztJQUdMLHVCQUFDO0FBQUQsQ0FBQyxBQWpDRCxJQWlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIEluamVjdGFibGUsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0Jhc2VDb21wb25lbnRXcmFwcGVyLCBGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLCBXcmFwcGFibGVJbnRlcmZhY2V9IGZyb20gJ0BhZy1ncmlkLWNvbW11bml0eS9jb3JlJztcbmltcG9ydCB7QWdGcmFtZXdvcmtDb21wb25lbnR9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudFdyYXBwZXI8V3JhcHBhYmxlSW50ZXJmYWNlPiBpbXBsZW1lbnRzIEZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIge1xuICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcbiAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyO1xuXG4gICAgcHVibGljIHNldFZpZXdDb250YWluZXJSZWYodmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYgPSB2aWV3Q29udGFpbmVyUmVmO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XG4gICAgfVxuXG4gICAgY3JlYXRlV3JhcHBlcihPcmlnaW5hbENvbnN0cnVjdG9yOiB7IG5ldygpOiBhbnkgfSk6IFdyYXBwYWJsZUludGVyZmFjZSB7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgICAgICBjbGFzcyBEeW5hbWljQWdOZzJDb21wb25lbnQgZXh0ZW5kcyBCYXNlR3VpQ29tcG9uZW50PGFueSwgQWdGcmFtZXdvcmtDb21wb25lbnQ8YW55Pj4gaW1wbGVtZW50cyBXcmFwcGFibGVJbnRlcmZhY2Uge1xuICAgICAgICAgICAgaW5pdChwYXJhbXM6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIHN1cGVyLmluaXQocGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlQ29tcG9uZW50KCk6IENvbXBvbmVudFJlZjxBZ0ZyYW1ld29ya0NvbXBvbmVudDxhbnk+PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuY3JlYXRlQ29tcG9uZW50KE9yaWdpbmFsQ29uc3RydWN0b3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoYXNNZXRob2QobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKVtuYW1lXSAhPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsTWV0aG9kKG5hbWU6IHN0cmluZywgYXJnczogSUFyZ3VtZW50cyk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoaXMuZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlci5nZXRGcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSgpW25hbWVdLmFwcGx5KGNvbXBvbmVudFJlZiwgYXJncylcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRNZXRob2QobmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVyW25hbWVdID0gY2FsbGJhY2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3cmFwcGVyOiBEeW5hbWljQWdOZzJDb21wb25lbnQgPSBuZXcgRHluYW1pY0FnTmcyQ29tcG9uZW50KCk7XG4gICAgICAgIHJldHVybiB3cmFwcGVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVDb21wb25lbnQ8VD4oY29tcG9uZW50VHlwZTogeyBuZXcoLi4uYXJnczogYW55W10pOiBUOyB9KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICAgICAgLy8gdXNlZCB0byBjYWNoZSB0aGUgZmFjdG9yeSwgYnV0IHRoaXMgYSkgY2F1c2VkIGlzc3VlcyB3aGVuIHVzZWQgd2l0aCBlaXRoZXIgd2VicGFjay9hbmd1bGFyY2xpIHdpdGggLS1wcm9kXG4gICAgICAgIC8vIGJ1dCBtb3JlIHNpZ25pZmljYW50bHksIHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIHJlc29sdmVDb21wb25lbnRGYWN0b3J5IHVzZXMgYSBtYXAgdG9vLCBzbyB1c1xuICAgICAgICAvLyBjYWNoaW5nIHRoZSBmYWN0b3J5IGhlcmUgeWllbGRzIG5vIHBlcmZvcm1hbmNlIGJlbmVmaXRzXG4gICAgICAgIGxldCBmYWN0b3J5ID0gdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50VHlwZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnkpO1xuICAgIH1cbn1cblxuYWJzdHJhY3QgY2xhc3MgQmFzZUd1aUNvbXBvbmVudDxQLCBUIGV4dGVuZHMgQWdGcmFtZXdvcmtDb21wb25lbnQ8UD4+IHtcbiAgICBwcm90ZWN0ZWQgX3BhcmFtczogUDtcbiAgICBwcm90ZWN0ZWQgX2VHdWk6IEhUTUxFbGVtZW50O1xuICAgIHByb3RlY3RlZCBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8VD47XG4gICAgcHJvdGVjdGVkIF9hZ0F3YXJlQ29tcG9uZW50OiBUO1xuICAgIHByb3RlY3RlZCBfZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2U6IGFueTsgIC8vIHRoZSB1c2VycyBjb21wb25lbnQgLSBmb3IgYWNjZXNzaW5nIG1ldGhvZHMgdGhleSBjcmVhdGVcblxuICAgIHByb3RlY3RlZCBpbml0KHBhcmFtczogUCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9wYXJhbXMgPSBwYXJhbXM7XG5cbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gdGhpcy5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgdGhpcy5fYWdBd2FyZUNvbXBvbmVudCA9IHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZTtcbiAgICAgICAgdGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2U7XG4gICAgICAgIHRoaXMuX2VHdWkgPSB0aGlzLl9jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcblxuICAgICAgICB0aGlzLl9hZ0F3YXJlQ29tcG9uZW50LmFnSW5pdCh0aGlzLl9wYXJhbXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRHdWkoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fZUd1aTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudFJlZikge1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRGcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUNvbXBvbmVudCgpOiBDb21wb25lbnRSZWY8VD47XG59XG4iXX0=
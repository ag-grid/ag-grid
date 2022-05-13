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
        if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === 'function') {
            this._frameworkComponentInstance.destroy();
        }
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AYWctZ3JpZC1jb21tdW5pdHkvYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUF5QyxVQUFVLEVBQW1CLE1BQU0sZUFBZSxDQUFDO0FBQ25HLE9BQU8sRUFBQyxvQkFBb0IsRUFBZ0QsTUFBTSx5QkFBeUIsQ0FBQztBQUk1RztJQUFzRCxvREFBd0M7SUFBOUY7O0lBbURBLENBQUM7SUEvQ1UsOERBQW1CLEdBQTFCLFVBQTJCLGdCQUFrQztRQUN6RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFDN0MsQ0FBQztJQUVNLHNFQUEyQixHQUFsQyxVQUFtQyx3QkFBa0Q7UUFDakYsSUFBSSxDQUFDLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0lBQzdELENBQUM7SUFFRCx3REFBYSxHQUFiLFVBQWMsbUJBQW1DO1FBQzdDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQjtZQUFvQyx5Q0FBZ0Q7WUFBcEY7O1lBdUJBLENBQUM7WUF0Qkcsb0NBQUksR0FBSixVQUFLLE1BQVc7Z0JBQ1osaUJBQU0sSUFBSSxZQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pELENBQUM7WUFFUywrQ0FBZSxHQUF6QjtnQkFDSSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQseUNBQVMsR0FBVCxVQUFVLElBQVk7Z0JBQ2xCLE9BQU8sT0FBTyxDQUFDLDZCQUE2QixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2pFLENBQUM7WUFFRCwwQ0FBVSxHQUFWLFVBQVcsSUFBWSxFQUFFLElBQWdCO2dCQUNyQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztnQkFDMUQsT0FBTyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBRWxGLENBQUM7WUFFRCx5Q0FBUyxHQUFULFVBQVUsSUFBWSxFQUFFLFFBQWtCO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFBO1lBQzVCLENBQUM7WUFDTCw0QkFBQztRQUFELENBQUMsQUF2QkQsQ0FBb0MsZ0JBQWdCLEdBdUJuRDtRQUVELElBQUksT0FBTyxHQUEwQixJQUFJLHFCQUFxQixFQUFFLENBQUM7UUFDakUsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLDBEQUFlLEdBQXRCLFVBQTBCLGFBQTBDO1FBQ2hFLDRHQUE0RztRQUM1Ryx5R0FBeUc7UUFDekcsMERBQTBEO1FBQzFELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQWxEUSxnQ0FBZ0M7UUFENUMsVUFBVSxFQUFFO09BQ0EsZ0NBQWdDLENBbUQ1QztJQUFELHVDQUFDO0NBQUEsQUFuREQsQ0FBc0Qsb0JBQW9CLEdBbUR6RTtTQW5EWSxnQ0FBZ0M7QUFxRDdDO0lBQUE7SUFvQ0EsQ0FBQztJQTdCYSwrQkFBSSxHQUFkLFVBQWUsTUFBUztRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDckQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQy9ELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO1FBRXZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSxpQ0FBTSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFTSxrQ0FBTyxHQUFkO1FBQ0ksSUFBRyxJQUFJLENBQUMsMkJBQTJCLElBQUksT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRTtZQUNuRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDOUM7UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFFTSx3REFBNkIsR0FBcEM7UUFDSSxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQztJQUM1QyxDQUFDO0lBR0wsdUJBQUM7QUFBRCxDQUFDLEFBcENELElBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIENvbXBvbmVudFJlZiwgSW5qZWN0YWJsZSwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7QmFzZUNvbXBvbmVudFdyYXBwZXIsIEZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsIFdyYXBwYWJsZUludGVyZmFjZX0gZnJvbSAnQGFnLWdyaWQtY29tbXVuaXR5L2NvcmUnO1xuaW1wb3J0IHtBZ0ZyYW1ld29ya0NvbXBvbmVudH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50V3JhcHBlcjxXcmFwcGFibGVJbnRlcmZhY2U+IGltcGxlbWVudHMgRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciB7XG4gICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XG5cbiAgICBwdWJsaWMgc2V0Vmlld0NvbnRhaW5lclJlZih2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgICAgIHRoaXMudmlld0NvbnRhaW5lclJlZiA9IHZpZXdDb250YWluZXJSZWY7XG4gICAgfVxuXG4gICAgcHVibGljIHNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcihjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcbiAgICB9XG5cbiAgICBjcmVhdGVXcmFwcGVyKE9yaWdpbmFsQ29uc3RydWN0b3I6IHsgbmV3KCk6IGFueSB9KTogV3JhcHBhYmxlSW50ZXJmYWNlIHtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIGNsYXNzIER5bmFtaWNBZ05nMkNvbXBvbmVudCBleHRlbmRzIEJhc2VHdWlDb21wb25lbnQ8YW55LCBBZ0ZyYW1ld29ya0NvbXBvbmVudDxhbnk+PiBpbXBsZW1lbnRzIFdyYXBwYWJsZUludGVyZmFjZSB7XG4gICAgICAgICAgICBpbml0KHBhcmFtczogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgc3VwZXIuaW5pdChwYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb3RlY3RlZCBjcmVhdGVDb21wb25lbnQoKTogQ29tcG9uZW50UmVmPEFnRnJhbWV3b3JrQ29tcG9uZW50PGFueT4+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5jcmVhdGVDb21wb25lbnQoT3JpZ2luYWxDb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhhc01ldGhvZChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlci5nZXRGcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSgpW25hbWVdICE9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxNZXRob2QobmFtZTogc3RyaW5nLCBhcmdzOiBJQXJndW1lbnRzKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50UmVmID0gdGhpcy5nZXRGcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVyLmdldEZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlKClbbmFtZV0uYXBwbHkoY29tcG9uZW50UmVmLCBhcmdzKVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkZE1ldGhvZChuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICAgICAgICAgIHdyYXBwZXJbbmFtZV0gPSBjYWxsYmFja1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHdyYXBwZXI6IER5bmFtaWNBZ05nMkNvbXBvbmVudCA9IG5ldyBEeW5hbWljQWdOZzJDb21wb25lbnQoKTtcbiAgICAgICAgcmV0dXJuIHdyYXBwZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZUNvbXBvbmVudDxUPihjb21wb25lbnRUeXBlOiB7IG5ldyguLi5hcmdzOiBhbnlbXSk6IFQ7IH0pOiBDb21wb25lbnRSZWY8VD4ge1xuICAgICAgICAvLyB1c2VkIHRvIGNhY2hlIHRoZSBmYWN0b3J5LCBidXQgdGhpcyBhKSBjYXVzZWQgaXNzdWVzIHdoZW4gdXNlZCB3aXRoIGVpdGhlciB3ZWJwYWNrL2FuZ3VsYXJjbGkgd2l0aCAtLXByb2RcbiAgICAgICAgLy8gYnV0IG1vcmUgc2lnbmlmaWNhbnRseSwgdGhlIHVuZGVybHlpbmcgaW1wbGVtZW50YXRpb24gb2YgcmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkgdXNlcyBhIG1hcCB0b28sIHNvIHVzXG4gICAgICAgIC8vIGNhY2hpbmcgdGhlIGZhY3RvcnkgaGVyZSB5aWVsZHMgbm8gcGVyZm9ybWFuY2UgYmVuZWZpdHNcbiAgICAgICAgbGV0IGZhY3RvcnkgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShjb21wb25lbnRUeXBlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSk7XG4gICAgfVxufVxuXG5hYnN0cmFjdCBjbGFzcyBCYXNlR3VpQ29tcG9uZW50PFAsIFQgZXh0ZW5kcyBBZ0ZyYW1ld29ya0NvbXBvbmVudDxQPj4ge1xuICAgIHByb3RlY3RlZCBfcGFyYW1zOiBQO1xuICAgIHByb3RlY3RlZCBfZUd1aTogSFRNTEVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxUPjtcbiAgICBwcm90ZWN0ZWQgX2FnQXdhcmVDb21wb25lbnQ6IFQ7XG4gICAgcHJvdGVjdGVkIF9mcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZTogYW55OyAgLy8gdGhlIHVzZXJzIGNvbXBvbmVudCAtIGZvciBhY2Nlc3NpbmcgbWV0aG9kcyB0aGV5IGNyZWF0ZVxuXG4gICAgcHJvdGVjdGVkIGluaXQocGFyYW1zOiBQKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3BhcmFtcyA9IHBhcmFtcztcblxuICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB0aGlzLmNyZWF0ZUNvbXBvbmVudCgpO1xuICAgICAgICB0aGlzLl9hZ0F3YXJlQ29tcG9uZW50ID0gdGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgICAgICB0aGlzLl9mcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSA9IHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZTtcbiAgICAgICAgdGhpcy5fZUd1aSA9IHRoaXMuX2NvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuX2FnQXdhcmVDb21wb25lbnQuYWdJbml0KHRoaXMuX3BhcmFtcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEd1aSgpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lR3VpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZih0aGlzLl9mcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSAmJiB0eXBlb2YgdGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRSZWYpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVDb21wb25lbnQoKTogQ29tcG9uZW50UmVmPFQ+O1xufVxuIl19
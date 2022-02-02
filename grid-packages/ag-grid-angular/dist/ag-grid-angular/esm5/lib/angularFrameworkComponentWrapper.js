import { __decorate, __extends } from "tslib";
import { Injectable } from "@angular/core";
import { BaseComponentWrapper } from 'ag-grid-community';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hZy1ncmlkLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBeUMsVUFBVSxFQUFtQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUMsb0JBQW9CLEVBQWdELE1BQU0sbUJBQW1CLENBQUM7QUFJdEc7SUFBc0Qsb0RBQXdDO0lBQTlGOztJQW1EQSxDQUFDO0lBL0NVLDhEQUFtQixHQUExQixVQUEyQixnQkFBa0M7UUFDekQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQzdDLENBQUM7SUFFTSxzRUFBMkIsR0FBbEMsVUFBbUMsd0JBQWtEO1FBQ2pGLElBQUksQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztJQUM3RCxDQUFDO0lBRUQsd0RBQWEsR0FBYixVQUFjLG1CQUFtQztRQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEI7WUFBb0MseUNBQWdEO1lBQXBGOztZQXVCQSxDQUFDO1lBdEJHLG9DQUFJLEdBQUosVUFBSyxNQUFXO2dCQUNaLGlCQUFNLElBQUksWUFBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN6RCxDQUFDO1lBRVMsK0NBQWUsR0FBekI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELHlDQUFTLEdBQVQsVUFBVSxJQUFZO2dCQUNsQixPQUFPLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNqRSxDQUFDO1lBRUQsMENBQVUsR0FBVixVQUFXLElBQVksRUFBRSxJQUFnQjtnQkFDckMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7Z0JBQzFELE9BQU8sT0FBTyxDQUFDLDZCQUE2QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUVsRixDQUFDO1lBRUQseUNBQVMsR0FBVCxVQUFVLElBQVksRUFBRSxRQUFrQjtnQkFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQTtZQUM1QixDQUFDO1lBQ0wsNEJBQUM7UUFBRCxDQUFDLEFBdkJELENBQW9DLGdCQUFnQixHQXVCbkQ7UUFFRCxJQUFJLE9BQU8sR0FBMEIsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1FBQ2pFLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFTSwwREFBZSxHQUF0QixVQUEwQixhQUEwQztRQUNoRSw0R0FBNEc7UUFDNUcseUdBQXlHO1FBQ3pHLDBEQUEwRDtRQUMxRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkYsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFsRFEsZ0NBQWdDO1FBRDVDLFVBQVUsRUFBRTtPQUNBLGdDQUFnQyxDQW1ENUM7SUFBRCx1Q0FBQztDQUFBLEFBbkRELENBQXNELG9CQUFvQixHQW1EekU7U0FuRFksZ0NBQWdDO0FBcUQ3QztJQUFBO0lBb0NBLENBQUM7SUE3QmEsK0JBQUksR0FBZCxVQUFlLE1BQVM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQ3JELElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztRQUV2RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0saUNBQU0sR0FBYjtRQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRU0sa0NBQU8sR0FBZDtRQUNJLElBQUcsSUFBSSxDQUFDLDJCQUEyQixJQUFJLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUU7WUFDbkcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRU0sd0RBQTZCLEdBQXBDO1FBQ0ksT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUM7SUFDNUMsQ0FBQztJQUdMLHVCQUFDO0FBQUQsQ0FBQyxBQXBDRCxJQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIEluamVjdGFibGUsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0Jhc2VDb21wb25lbnRXcmFwcGVyLCBGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLCBXcmFwcGFibGVJbnRlcmZhY2V9IGZyb20gJ2FnLWdyaWQtY29tbXVuaXR5JztcbmltcG9ydCB7QWdGcmFtZXdvcmtDb21wb25lbnR9IGZyb20gXCIuL2ludGVyZmFjZXNcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudFdyYXBwZXI8V3JhcHBhYmxlSW50ZXJmYWNlPiBpbXBsZW1lbnRzIEZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIge1xuICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZjtcbiAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyO1xuXG4gICAgcHVibGljIHNldFZpZXdDb250YWluZXJSZWYodmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgICAgICB0aGlzLnZpZXdDb250YWluZXJSZWYgPSB2aWV3Q29udGFpbmVyUmVmO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XG4gICAgfVxuXG4gICAgY3JlYXRlV3JhcHBlcihPcmlnaW5hbENvbnN0cnVjdG9yOiB7IG5ldygpOiBhbnkgfSk6IFdyYXBwYWJsZUludGVyZmFjZSB7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgICAgICBjbGFzcyBEeW5hbWljQWdOZzJDb21wb25lbnQgZXh0ZW5kcyBCYXNlR3VpQ29tcG9uZW50PGFueSwgQWdGcmFtZXdvcmtDb21wb25lbnQ8YW55Pj4gaW1wbGVtZW50cyBXcmFwcGFibGVJbnRlcmZhY2Uge1xuICAgICAgICAgICAgaW5pdChwYXJhbXM6IGFueSk6IHZvaWQge1xuICAgICAgICAgICAgICAgIHN1cGVyLmluaXQocGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlQ29tcG9uZW50KCk6IENvbXBvbmVudFJlZjxBZ0ZyYW1ld29ya0NvbXBvbmVudDxhbnk+PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQuY3JlYXRlQ29tcG9uZW50KE9yaWdpbmFsQ29uc3RydWN0b3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoYXNNZXRob2QobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKVtuYW1lXSAhPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWxsTWV0aG9kKG5hbWU6IHN0cmluZywgYXJnczogSUFyZ3VtZW50cyk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoaXMuZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlci5nZXRGcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZSgpW25hbWVdLmFwcGx5KGNvbXBvbmVudFJlZiwgYXJncylcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRNZXRob2QobmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVyW25hbWVdID0gY2FsbGJhY2tcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3cmFwcGVyOiBEeW5hbWljQWdOZzJDb21wb25lbnQgPSBuZXcgRHluYW1pY0FnTmcyQ29tcG9uZW50KCk7XG4gICAgICAgIHJldHVybiB3cmFwcGVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVDb21wb25lbnQ8VD4oY29tcG9uZW50VHlwZTogeyBuZXcoLi4uYXJnczogYW55W10pOiBUOyB9KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICAgICAgLy8gdXNlZCB0byBjYWNoZSB0aGUgZmFjdG9yeSwgYnV0IHRoaXMgYSkgY2F1c2VkIGlzc3VlcyB3aGVuIHVzZWQgd2l0aCBlaXRoZXIgd2VicGFjay9hbmd1bGFyY2xpIHdpdGggLS1wcm9kXG4gICAgICAgIC8vIGJ1dCBtb3JlIHNpZ25pZmljYW50bHksIHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uIG9mIHJlc29sdmVDb21wb25lbnRGYWN0b3J5IHVzZXMgYSBtYXAgdG9vLCBzbyB1c1xuICAgICAgICAvLyBjYWNoaW5nIHRoZSBmYWN0b3J5IGhlcmUgeWllbGRzIG5vIHBlcmZvcm1hbmNlIGJlbmVmaXRzXG4gICAgICAgIGxldCBmYWN0b3J5ID0gdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50VHlwZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnkpO1xuICAgIH1cbn1cblxuYWJzdHJhY3QgY2xhc3MgQmFzZUd1aUNvbXBvbmVudDxQLCBUIGV4dGVuZHMgQWdGcmFtZXdvcmtDb21wb25lbnQ8UD4+IHtcbiAgICBwcm90ZWN0ZWQgX3BhcmFtczogUDtcbiAgICBwcm90ZWN0ZWQgX2VHdWk6IEhUTUxFbGVtZW50O1xuICAgIHByb3RlY3RlZCBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8VD47XG4gICAgcHJvdGVjdGVkIF9hZ0F3YXJlQ29tcG9uZW50OiBUO1xuICAgIHByb3RlY3RlZCBfZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2U6IGFueTsgIC8vIHRoZSB1c2VycyBjb21wb25lbnQgLSBmb3IgYWNjZXNzaW5nIG1ldGhvZHMgdGhleSBjcmVhdGVcblxuICAgIHByb3RlY3RlZCBpbml0KHBhcmFtczogUCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9wYXJhbXMgPSBwYXJhbXM7XG5cbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gdGhpcy5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgdGhpcy5fYWdBd2FyZUNvbXBvbmVudCA9IHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZTtcbiAgICAgICAgdGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2U7XG4gICAgICAgIHRoaXMuX2VHdWkgPSB0aGlzLl9jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudDtcblxuICAgICAgICB0aGlzLl9hZ0F3YXJlQ29tcG9uZW50LmFnSW5pdCh0aGlzLl9wYXJhbXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRHdWkoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fZUd1aTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYodGhpcy5fZnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UgJiYgdHlwZW9mIHRoaXMuX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50UmVmKSB7XG4gICAgICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZXdvcmtDb21wb25lbnRJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlQ29tcG9uZW50KCk6IENvbXBvbmVudFJlZjxUPjtcbn1cbiJdfQ==
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
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hZy1ncmlkLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBeUMsVUFBVSxFQUFtQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUMsb0JBQW9CLEVBQWdELE1BQU0sbUJBQW1CLENBQUM7QUFJdEc7SUFBc0Qsb0RBQXdDO0lBQTlGOztJQW1EQSxDQUFDO0lBL0NVLDhEQUFtQixHQUExQixVQUEyQixnQkFBa0M7UUFDekQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQzdDLENBQUM7SUFFTSxzRUFBMkIsR0FBbEMsVUFBbUMsd0JBQWtEO1FBQ2pGLElBQUksQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztJQUM3RCxDQUFDO0lBRUQsd0RBQWEsR0FBYixVQUFjLG1CQUFtQztRQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEI7WUFBb0MseUNBQWdEO1lBQXBGOztZQXVCQSxDQUFDO1lBdEJHLG9DQUFJLEdBQUosVUFBSyxNQUFXO2dCQUNaLGlCQUFNLElBQUksWUFBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN6RCxDQUFDO1lBRVMsK0NBQWUsR0FBekI7Z0JBQ0ksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELHlDQUFTLEdBQVQsVUFBVSxJQUFZO2dCQUNsQixPQUFPLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNqRSxDQUFDO1lBRUQsMENBQVUsR0FBVixVQUFXLElBQVksRUFBRSxJQUFnQjtnQkFDckMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7Z0JBQzFELE9BQU8sT0FBTyxDQUFDLDZCQUE2QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUVsRixDQUFDO1lBRUQseUNBQVMsR0FBVCxVQUFVLElBQVksRUFBRSxRQUFrQjtnQkFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQTtZQUM1QixDQUFDO1lBQ0wsNEJBQUM7UUFBRCxDQUFDLEFBdkJELENBQW9DLGdCQUFnQixHQXVCbkQ7UUFFRCxJQUFJLE9BQU8sR0FBMEIsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1FBQ2pFLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFTSwwREFBZSxHQUF0QixVQUEwQixhQUEwQztRQUNoRSw0R0FBNEc7UUFDNUcseUdBQXlHO1FBQ3pHLDBEQUEwRDtRQUMxRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkYsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFsRFEsZ0NBQWdDO1FBRDVDLFVBQVUsRUFBRTtPQUNBLGdDQUFnQyxDQW1ENUM7SUFBRCx1Q0FBQztDQUFBLEFBbkRELENBQXNELG9CQUFvQixHQW1EekU7U0FuRFksZ0NBQWdDO0FBcUQ3QztJQUFBO0lBaUNBLENBQUM7SUExQmEsK0JBQUksR0FBZCxVQUFlLE1BQVM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQ3JELElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztRQUV2RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0saUNBQU0sR0FBYjtRQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRU0sa0NBQU8sR0FBZDtRQUNJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUVNLHdEQUE2QixHQUFwQztRQUNJLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDO0lBQzVDLENBQUM7SUFHTCx1QkFBQztBQUFELENBQUMsQUFqQ0QsSUFpQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmLCBJbmplY3RhYmxlLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtCYXNlQ29tcG9uZW50V3JhcHBlciwgRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciwgV3JhcHBhYmxlSW50ZXJmYWNlfSBmcm9tICdhZy1ncmlkLWNvbW11bml0eSc7XG5pbXBvcnQge0FnRnJhbWV3b3JrQ29tcG9uZW50fSBmcm9tIFwiLi9pbnRlcmZhY2VzXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciBleHRlbmRzIEJhc2VDb21wb25lbnRXcmFwcGVyPFdyYXBwYWJsZUludGVyZmFjZT4gaW1wbGVtZW50cyBGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIHtcbiAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWY7XG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcblxuICAgIHB1YmxpYyBzZXRWaWV3Q29udGFpbmVyUmVmKHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmID0gdmlld0NvbnRhaW5lclJlZjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyID0gY29tcG9uZW50RmFjdG9yeVJlc29sdmVyO1xuICAgIH1cblxuICAgIGNyZWF0ZVdyYXBwZXIoT3JpZ2luYWxDb25zdHJ1Y3RvcjogeyBuZXcoKTogYW55IH0pOiBXcmFwcGFibGVJbnRlcmZhY2Uge1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgY2xhc3MgRHluYW1pY0FnTmcyQ29tcG9uZW50IGV4dGVuZHMgQmFzZUd1aUNvbXBvbmVudDxhbnksIEFnRnJhbWV3b3JrQ29tcG9uZW50PGFueT4+IGltcGxlbWVudHMgV3JhcHBhYmxlSW50ZXJmYWNlIHtcbiAgICAgICAgICAgIGluaXQocGFyYW1zOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBzdXBlci5pbml0KHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUNvbXBvbmVudCgpOiBDb21wb25lbnRSZWY8QWdGcmFtZXdvcmtDb21wb25lbnQ8YW55Pj4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LmNyZWF0ZUNvbXBvbmVudChPcmlnaW5hbENvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGFzTWV0aG9kKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVyLmdldEZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlKClbbmFtZV0gIT0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FsbE1ldGhvZChuYW1lOiBzdHJpbmcsIGFyZ3M6IElBcmd1bWVudHMpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRSZWYgPSB0aGlzLmdldEZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKVtuYW1lXS5hcHBseShjb21wb25lbnRSZWYsIGFyZ3MpXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkTWV0aG9kKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgd3JhcHBlcltuYW1lXSA9IGNhbGxiYWNrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd3JhcHBlcjogRHluYW1pY0FnTmcyQ29tcG9uZW50ID0gbmV3IER5bmFtaWNBZ05nMkNvbXBvbmVudCgpO1xuICAgICAgICByZXR1cm4gd3JhcHBlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlQ29tcG9uZW50PFQ+KGNvbXBvbmVudFR5cGU6IHsgbmV3KC4uLmFyZ3M6IGFueVtdKTogVDsgfSk6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgICAgIC8vIHVzZWQgdG8gY2FjaGUgdGhlIGZhY3RvcnksIGJ1dCB0aGlzIGEpIGNhdXNlZCBpc3N1ZXMgd2hlbiB1c2VkIHdpdGggZWl0aGVyIHdlYnBhY2svYW5ndWxhcmNsaSB3aXRoIC0tcHJvZFxuICAgICAgICAvLyBidXQgbW9yZSBzaWduaWZpY2FudGx5LCB0aGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBvZiByZXNvbHZlQ29tcG9uZW50RmFjdG9yeSB1c2VzIGEgbWFwIHRvbywgc28gdXNcbiAgICAgICAgLy8gY2FjaGluZyB0aGUgZmFjdG9yeSBoZXJlIHlpZWxkcyBubyBwZXJmb3JtYW5jZSBiZW5lZml0c1xuICAgICAgICBsZXQgZmFjdG9yeSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGNvbXBvbmVudFR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpcy52aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5KTtcbiAgICB9XG59XG5cbmFic3RyYWN0IGNsYXNzIEJhc2VHdWlDb21wb25lbnQ8UCwgVCBleHRlbmRzIEFnRnJhbWV3b3JrQ29tcG9uZW50PFA+PiB7XG4gICAgcHJvdGVjdGVkIF9wYXJhbXM6IFA7XG4gICAgcHJvdGVjdGVkIF9lR3VpOiBIVE1MRWxlbWVudDtcbiAgICBwcm90ZWN0ZWQgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPFQ+O1xuICAgIHByb3RlY3RlZCBfYWdBd2FyZUNvbXBvbmVudDogVDtcbiAgICBwcm90ZWN0ZWQgX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlOiBhbnk7ICAvLyB0aGUgdXNlcnMgY29tcG9uZW50IC0gZm9yIGFjY2Vzc2luZyBtZXRob2RzIHRoZXkgY3JlYXRlXG5cbiAgICBwcm90ZWN0ZWQgaW5pdChwYXJhbXM6IFApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcGFyYW1zID0gcGFyYW1zO1xuXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IHRoaXMuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgIHRoaXMuX2FnQXdhcmVDb21wb25lbnQgPSB0aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2U7XG4gICAgICAgIHRoaXMuX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlID0gdGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgICAgICB0aGlzLl9lR3VpID0gdGhpcy5fY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5fYWdBd2FyZUNvbXBvbmVudC5hZ0luaXQodGhpcy5fcGFyYW1zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0R3VpKCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VHdWk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRSZWYpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RnJhbWV3b3JrQ29tcG9uZW50SW5zdGFuY2UoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1ld29ya0NvbXBvbmVudEluc3RhbmNlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVDb21wb25lbnQoKTogQ29tcG9uZW50UmVmPFQ+O1xufVxuIl19
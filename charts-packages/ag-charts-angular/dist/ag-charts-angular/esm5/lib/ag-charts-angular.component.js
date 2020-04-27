/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
// noinspection AngularIncorrectTemplateDefinition
var AgChartsAngular = /** @class */ (function () {
    function AgChartsAngular(elementDef) {
        this._initialised = false;
        this._destroyed = false;
        this._nativeElement = elementDef.nativeElement;
    }
    /**
     * @return {?}
     */
    AgChartsAngular.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var options = this.applyContainerIfNotSet(this.options);
        this._chart = AgChart.create(options);
        this._initialised = true;
    };
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    AgChartsAngular.prototype.ngOnChanges = 
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (this._initialised) {
            AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
        }
    };
    /**
     * @return {?}
     */
    AgChartsAngular.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this._initialised) {
            if (this._chart) {
                this._chart.destroy();
            }
            this._destroyed = true;
        }
    };
    /**
     * @private
     * @param {?} propsOptions
     * @return {?}
     */
    AgChartsAngular.prototype.applyContainerIfNotSet = /**
     * @private
     * @param {?} propsOptions
     * @return {?}
     */
    function (propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return tslib_1.__assign({}, propsOptions, { container: this._nativeElement });
    };
    AgChartsAngular.decorators = [
        { type: Component, args: [{
                    selector: 'ag-charts-angular',
                    template: '',
                    encapsulation: ViewEncapsulation.None
                }] }
    ];
    /** @nocollapse */
    AgChartsAngular.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    AgChartsAngular.propDecorators = {
        options: [{ type: Input }]
    };
    return AgChartsAngular;
}());
export { AgChartsAngular };
if (false) {
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._nativeElement;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._initialised;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._destroyed;
    /**
     * @type {?}
     * @private
     */
    AgChartsAngular.prototype._chart;
    /** @type {?} */
    AgChartsAngular.prototype.options;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0YsT0FBTyxFQUFDLE9BQU8sRUFBUSxNQUFNLHFCQUFxQixDQUFDOztBQUduRDtJQWdCSSx5QkFBWSxVQUFzQjtRQVIxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBUXZCLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNuRCxDQUFDOzs7O0lBRUQseUNBQWU7OztJQUFmOztZQUNVLE9BQU8sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV6RCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVILDBEQUEwRDs7Ozs7O0lBQ3hELHFDQUFXOzs7Ozs7SUFBWCxVQUFZLE9BQVk7UUFDcEIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDMUU7SUFDTCxDQUFDOzs7O0lBRU0scUNBQVc7OztJQUFsQjtRQUNJLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN6QjtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQzs7Ozs7O0lBRU8sZ0RBQXNCOzs7OztJQUE5QixVQUErQixZQUFpQjtRQUM1QyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCw0QkFBVyxZQUFZLElBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUU7SUFDN0QsQ0FBQzs7Z0JBbERKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixRQUFRLEVBQUUsRUFBRTtvQkFDWixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtpQkFDeEM7Ozs7Z0JBVGlDLFVBQVU7OzswQkFrQnZDLEtBQUs7O0lBc0NWLHNCQUFDO0NBQUEsQUFuREQsSUFtREM7U0E5Q1ksZUFBZTs7Ozs7O0lBRXhCLHlDQUE0Qjs7Ozs7SUFDNUIsdUNBQTZCOzs7OztJQUM3QixxQ0FBMkI7Ozs7O0lBRTNCLGlDQUF1Qjs7SUFFdkIsa0NBQ3FCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHtBZ0NoYXJ0LCBDaGFydH0gZnJvbSAnYWctY2hhcnRzLWNvbW11bml0eSc7XG5cbi8vIG5vaW5zcGVjdGlvbiBBbmd1bGFySW5jb3JyZWN0VGVtcGxhdGVEZWZpbml0aW9uXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWNoYXJ0cy1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0NoYXJ0c0FuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcblxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfY2hhcnQhOiBDaGFydDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG9wdGlvbnMhOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2hhcnQgPSBBZ0NoYXJ0LmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHMsSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLl9jaGFydCwgdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5Q29udGFpbmVySWZOb3RTZXQocHJvcHNPcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYgKHByb3BzT3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wc09wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gey4uLnByb3BzT3B0aW9ucywgY29udGFpbmVyOiB0aGlzLl9uYXRpdmVFbGVtZW50fTtcbiAgICB9XG59XG4iXX0=
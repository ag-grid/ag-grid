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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0YsT0FBTyxFQUFTLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQzs7QUFHckU7SUFnQkkseUJBQVksVUFBc0I7UUFSMUIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQzs7OztJQUVELHlDQUFlOzs7SUFBZjs7WUFDVSxPQUFPLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFFSCwwREFBMEQ7Ozs7OztJQUN4RCxxQ0FBVzs7Ozs7O0lBQVgsVUFBWSxPQUFZO1FBQ3BCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzFFO0lBQ0wsQ0FBQzs7OztJQUVNLHFDQUFXOzs7SUFBbEI7UUFDSSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDekI7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUMxQjtJQUNMLENBQUM7Ozs7OztJQUVPLGdEQUFzQjs7Ozs7SUFBOUIsVUFBK0IsWUFBNEI7UUFDdkQsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO1lBQ3hCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBRUQsNEJBQVcsWUFBWSxJQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFFO0lBQzdELENBQUM7O2dCQWxESixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsUUFBUSxFQUFFLEVBQUU7b0JBQ1osYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3hDOzs7O2dCQVRpQyxVQUFVOzs7MEJBa0J2QyxLQUFLOztJQXNDVixzQkFBQztDQUFBLEFBbkRELElBbURDO1NBOUNZLGVBQWU7Ozs7OztJQUV4Qix5Q0FBNEI7Ozs7O0lBQzVCLHVDQUE2Qjs7Ozs7SUFDN0IscUNBQTJCOzs7OztJQUUzQixpQ0FBdUI7O0lBRXZCLGtDQUNnQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7IENoYXJ0LCBBZ0NoYXJ0LCBBZ0NoYXJ0T3B0aW9ucyB9IGZyb20gJ2FnLWNoYXJ0cy1jb21tdW5pdHknO1xuXG4vLyBub2luc3BlY3Rpb24gQW5ndWxhckluY29ycmVjdFRlbXBsYXRlRGVmaW5pdGlvblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1jaGFydHMtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdDaGFydHNBbmd1bGFyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2NoYXJ0ITogQ2hhcnQ7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBvcHRpb25zITogQWdDaGFydE9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2hhcnQgPSBBZ0NoYXJ0LmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHMsSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLl9jaGFydCwgdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5Q29udGFpbmVySWZOb3RTZXQocHJvcHNPcHRpb25zOiBBZ0NoYXJ0T3B0aW9ucykge1xuICAgICAgICBpZiAocHJvcHNPcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzT3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7Li4ucHJvcHNPcHRpb25zLCBjb250YWluZXI6IHRoaXMuX25hdGl2ZUVsZW1lbnR9O1xuICAgIH1cbn1cbiJdfQ==
/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
/**
 * @record
 */
export function AgLegendProps() { }
if (false) {
    /** @type {?|undefined} */
    AgLegendProps.prototype.enabled;
    /** @type {?|undefined} */
    AgLegendProps.prototype.padding;
    /** @type {?|undefined} */
    AgLegendProps.prototype.itemPaddingX;
    /** @type {?|undefined} */
    AgLegendProps.prototype.itemPaddingY;
    /** @type {?|undefined} */
    AgLegendProps.prototype.markerSize;
    /** @type {?|undefined} */
    AgLegendProps.prototype.markerStrokeWidth;
    /** @type {?|undefined} */
    AgLegendProps.prototype.labelColor;
    /** @type {?|undefined} */
    AgLegendProps.prototype.labelFontFamily;
}
/**
 * @record
 */
export function Series() { }
if (false) {
    /** @type {?|undefined} */
    Series.prototype.type;
    /** @type {?} */
    Series.prototype.xKey;
    /** @type {?} */
    Series.prototype.yKey;
}
/**
 * @record
 */
export function AgChartOptions() { }
if (false) {
    /** @type {?|undefined} */
    AgChartOptions.prototype.width;
    /** @type {?|undefined} */
    AgChartOptions.prototype.height;
    /** @type {?|undefined} */
    AgChartOptions.prototype.data;
    /** @type {?} */
    AgChartOptions.prototype.series;
    /** @type {?|undefined} */
    AgChartOptions.prototype.legend;
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0YsT0FBTyxFQUFDLE9BQU8sRUFBUSxNQUFNLHFCQUFxQixDQUFDOzs7O0FBRW5ELG1DQVNDOzs7SUFSRyxnQ0FBa0I7O0lBQ2xCLGdDQUFpQjs7SUFDakIscUNBQXNCOztJQUN0QixxQ0FBc0I7O0lBQ3RCLG1DQUFvQjs7SUFDcEIsMENBQTJCOztJQUMzQixtQ0FBb0I7O0lBQ3BCLHdDQUF5Qjs7Ozs7QUFHN0IsNEJBSUM7OztJQUhHLHNCQUFjOztJQUNkLHNCQUFhOztJQUNiLHNCQUFhOzs7OztBQUdqQixvQ0FNQzs7O0lBTEcsK0JBQWU7O0lBQ2YsZ0NBQWdCOztJQUNoQiw4QkFBYTs7SUFDYixnQ0FBaUI7O0lBQ2pCLGdDQUF1Qjs7O0FBSTNCO0lBZ0JJLHlCQUFZLFVBQXNCO1FBUjFCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFRdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ25ELENBQUM7Ozs7SUFFRCx5Q0FBZTs7O0lBQWY7O1lBQ1UsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUgsMERBQTBEOzs7Ozs7SUFDeEQscUNBQVc7Ozs7OztJQUFYLFVBQVksT0FBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7Ozs7SUFFTSxxQ0FBVzs7O0lBQWxCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7SUFDTCxDQUFDOzs7Ozs7SUFFTyxnREFBc0I7Ozs7O0lBQTlCLFVBQStCLFlBQWlCO1FBQzVDLElBQUksWUFBWSxDQUFDLFNBQVMsRUFBRTtZQUN4QixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUVELDRCQUFXLFlBQVksSUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBRTtJQUM3RCxDQUFDOztnQkFsREosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLFFBQVEsRUFBRSxFQUFFO29CQUNaLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN4Qzs7OztnQkFsQ2lDLFVBQVU7OzswQkEyQ3ZDLEtBQUs7O0lBc0NWLHNCQUFDO0NBQUEsQUFuREQsSUFtREM7U0E5Q1ksZUFBZTs7Ozs7O0lBRXhCLHlDQUE0Qjs7Ozs7SUFDNUIsdUNBQTZCOzs7OztJQUM3QixxQ0FBMkI7Ozs7O0lBRTNCLGlDQUF1Qjs7SUFFdkIsa0NBQ2dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHtBZ0NoYXJ0LCBDaGFydH0gZnJvbSAnYWctY2hhcnRzLWNvbW11bml0eSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWdMZWdlbmRQcm9wcyB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgcGFkZGluZz86IG51bWJlcjtcbiAgICBpdGVtUGFkZGluZ1g/OiBudW1iZXI7XG4gICAgaXRlbVBhZGRpbmdZPzogbnVtYmVyO1xuICAgIG1hcmtlclNpemU/OiBudW1iZXI7XG4gICAgbWFya2VyU3Ryb2tlV2lkdGg/OiBudW1iZXI7XG4gICAgbGFiZWxDb2xvcj86IHN0cmluZztcbiAgICBsYWJlbEZvbnRGYW1pbHk/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWVzIHtcbiAgICB0eXBlPzogc3RyaW5nO1xuICAgIHhLZXk6IHN0cmluZztcbiAgICB5S2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWdDaGFydE9wdGlvbnMge1xuICAgIHdpZHRoPzogbnVtYmVyO1xuICAgIGhlaWdodD86IG51bWJlcjtcbiAgICBkYXRhPzogYW55W107XG4gICAgc2VyaWVzOiBTZXJpZXNbXTtcbiAgICBsZWdlbmQ/OiBBZ0xlZ2VuZFByb3BzO1xufVxuXG4vLyBub2luc3BlY3Rpb24gQW5ndWxhckluY29ycmVjdFRlbXBsYXRlRGVmaW5pdGlvblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1jaGFydHMtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdDaGFydHNBbmd1bGFyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgX2NoYXJ0ITogQ2hhcnQ7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBvcHRpb25zITogQWdDaGFydE9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2hhcnQgPSBBZ0NoYXJ0LmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHMsSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLl9jaGFydCwgdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5Q29udGFpbmVySWZOb3RTZXQocHJvcHNPcHRpb25zOiBhbnkpIHtcbiAgICAgICAgaWYgKHByb3BzT3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wc09wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gey4uLnByb3BzT3B0aW9ucywgY29udGFpbmVyOiB0aGlzLl9uYXRpdmVFbGVtZW50fTtcbiAgICB9XG59XG4iXX0=
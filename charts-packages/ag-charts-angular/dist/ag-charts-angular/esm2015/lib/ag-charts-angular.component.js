/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
export class AgChartsAngular {
    /**
     * @param {?} elementDef
     */
    constructor(elementDef) {
        this._initialised = false;
        this._destroyed = false;
        this._nativeElement = elementDef.nativeElement;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        /** @type {?} */
        const options = this.applyContainerIfNotSet(this.options);
        this._chart = AgChart.create(options);
        this._initialised = true;
    }
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this._initialised) {
            AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this._initialised) {
            if (this._chart) {
                this._chart.destroy();
            }
            this._destroyed = true;
        }
    }
    /**
     * @private
     * @param {?} propsOptions
     * @return {?}
     */
    applyContainerIfNotSet(propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return Object.assign({}, propsOptions, { container: this._nativeElement });
    }
}
AgChartsAngular.decorators = [
    { type: Component, args: [{
                selector: 'ag-charts-angular',
                template: '',
                encapsulation: ViewEncapsulation.None
            }] }
];
/** @nocollapse */
AgChartsAngular.ctorParameters = () => [
    { type: ElementRef }
];
AgChartsAngular.propDecorators = {
    options: [{ type: Input }]
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFnQixTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RixPQUFPLEVBQUMsT0FBTyxFQUFRLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFFbkQsbUNBU0M7OztJQVJHLGdDQUFrQjs7SUFDbEIsZ0NBQWlCOztJQUNqQixxQ0FBc0I7O0lBQ3RCLHFDQUFzQjs7SUFDdEIsbUNBQW9COztJQUNwQiwwQ0FBMkI7O0lBQzNCLG1DQUFvQjs7SUFDcEIsd0NBQXlCOzs7OztBQUc3Qiw0QkFJQzs7O0lBSEcsc0JBQWM7O0lBQ2Qsc0JBQWE7O0lBQ2Isc0JBQWE7Ozs7O0FBR2pCLG9DQU1DOzs7SUFMRywrQkFBZTs7SUFDZixnQ0FBZ0I7O0lBQ2hCLDhCQUFhOztJQUNiLGdDQUFpQjs7SUFDakIsZ0NBQXVCOzs7QUFTM0IsTUFBTSxPQUFPLGVBQWU7Ozs7SUFXeEIsWUFBWSxVQUFzQjtRQVIxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBUXZCLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNuRCxDQUFDOzs7O0lBRUQsZUFBZTs7Y0FDTCxPQUFPLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7Ozs7OztJQUdELFdBQVcsQ0FBQyxPQUFZO1FBQ3BCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzFFO0lBQ0wsQ0FBQzs7OztJQUVNLFdBQVc7UUFDZCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDekI7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUMxQjtJQUNMLENBQUM7Ozs7OztJQUVPLHNCQUFzQixDQUFDLFlBQWlCO1FBQzVDLElBQUksWUFBWSxDQUFDLFNBQVMsRUFBRTtZQUN4QixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUVELHlCQUFXLFlBQVksSUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBRTtJQUM3RCxDQUFDOzs7WUFsREosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2FBQ3hDOzs7O1lBbENpQyxVQUFVOzs7c0JBMkN2QyxLQUFLOzs7Ozs7O0lBTk4seUNBQTRCOzs7OztJQUM1Qix1Q0FBNkI7Ozs7O0lBQzdCLHFDQUEyQjs7Ozs7SUFFM0IsaUNBQXVCOztJQUV2QixrQ0FDZ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge0FnQ2hhcnQsIENoYXJ0fSBmcm9tICdhZy1jaGFydHMtY29tbXVuaXR5JztcblxuZXhwb3J0IGludGVyZmFjZSBBZ0xlZ2VuZFByb3BzIHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBwYWRkaW5nPzogbnVtYmVyO1xuICAgIGl0ZW1QYWRkaW5nWD86IG51bWJlcjtcbiAgICBpdGVtUGFkZGluZ1k/OiBudW1iZXI7XG4gICAgbWFya2VyU2l6ZT86IG51bWJlcjtcbiAgICBtYXJrZXJTdHJva2VXaWR0aD86IG51bWJlcjtcbiAgICBsYWJlbENvbG9yPzogc3RyaW5nO1xuICAgIGxhYmVsRm9udEZhbWlseT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXJpZXMge1xuICAgIHR5cGU/OiBzdHJpbmc7XG4gICAgeEtleTogc3RyaW5nO1xuICAgIHlLZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBZ0NoYXJ0T3B0aW9ucyB7XG4gICAgd2lkdGg/OiBudW1iZXI7XG4gICAgaGVpZ2h0PzogbnVtYmVyO1xuICAgIGRhdGE/OiBhbnlbXTtcbiAgICBzZXJpZXM6IFNlcmllc1tdO1xuICAgIGxlZ2VuZD86IEFnTGVnZW5kUHJvcHM7XG59XG5cbi8vIG5vaW5zcGVjdGlvbiBBbmd1bGFySW5jb3JyZWN0VGVtcGxhdGVEZWZpbml0aW9uXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWNoYXJ0cy1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0NoYXJ0c0FuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcblxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfY2hhcnQhOiBDaGFydDtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG9wdGlvbnMhOiBBZ0NoYXJ0T3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9jaGFydCA9IEFnQ2hhcnQuY3JlYXRlKG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgLy8gbm9pbnNwZWN0aW9uIEpTVW51c2VkR2xvYmFsU3ltYm9scyxKU1VudXNlZExvY2FsU3ltYm9sc1xuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIEFnQ2hhcnQudXBkYXRlKHRoaXMuX2NoYXJ0LCB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhcnQuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlDb250YWluZXJJZk5vdFNldChwcm9wc09wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAocHJvcHNPcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzT3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7Li4ucHJvcHNPcHRpb25zLCBjb250YWluZXI6IHRoaXMuX25hdGl2ZUVsZW1lbnR9O1xuICAgIH1cbn1cbiJdfQ==
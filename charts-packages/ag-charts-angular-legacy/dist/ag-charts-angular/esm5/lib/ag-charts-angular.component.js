/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { __assign } from "tslib";
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
        return __assign(__assign({}, propsOptions), { container: this._nativeElement });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXItbGVnYWN5LyIsInNvdXJjZXMiOlsibGliL2FnLWNoYXJ0cy1hbmd1bGFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQWdCLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdGLE9BQU8sRUFBUyxPQUFPLEVBQWtCLE1BQU0scUJBQXFCLENBQUM7O0FBR3JFO0lBZ0JJLHlCQUFZLFVBQXNCO1FBUjFCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFRdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ25ELENBQUM7Ozs7SUFFRCx5Q0FBZTs7O0lBQWY7O1lBQ1UsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUgsMERBQTBEOzs7Ozs7SUFDeEQscUNBQVc7Ozs7OztJQUFYLFVBQVksT0FBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7Ozs7SUFFTSxxQ0FBVzs7O0lBQWxCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7SUFDTCxDQUFDOzs7Ozs7SUFFTyxnREFBc0I7Ozs7O0lBQTlCLFVBQStCLFlBQTRCO1FBQ3ZELElBQUksWUFBWSxDQUFDLFNBQVMsRUFBRTtZQUN4QixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUVELDZCQUFXLFlBQVksS0FBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsSUFBRTtJQUM3RCxDQUFDOztnQkFsREosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLFFBQVEsRUFBRSxFQUFFO29CQUNaLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN4Qzs7OztnQkFUaUMsVUFBVTs7OzBCQWtCdkMsS0FBSzs7SUFzQ1Ysc0JBQUM7Q0FBQSxBQW5ERCxJQW1EQztTQTlDWSxlQUFlOzs7Ozs7SUFFeEIseUNBQTRCOzs7OztJQUM1Qix1Q0FBNkI7Ozs7O0lBQzdCLHFDQUEyQjs7Ozs7SUFFM0IsaUNBQXVCOztJQUV2QixrQ0FDZ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBDaGFydCwgQWdDaGFydCwgQWdDaGFydE9wdGlvbnMgfSBmcm9tICdhZy1jaGFydHMtY29tbXVuaXR5JztcblxuLy8gbm9pbnNwZWN0aW9uIEFuZ3VsYXJJbmNvcnJlY3RUZW1wbGF0ZURlZmluaXRpb25cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctY2hhcnRzLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnQ2hhcnRzQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9jaGFydCE6IENoYXJ0O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgb3B0aW9ucyE6IEFnQ2hhcnRPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuYXBwbHlDb250YWluZXJJZk5vdFNldCh0aGlzLm9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX2NoYXJ0ID0gQWdDaGFydC5jcmVhdGUob3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuICAgIH1cblxuICAvLyBub2luc3BlY3Rpb24gSlNVbnVzZWRHbG9iYWxTeW1ib2xzLEpTVW51c2VkTG9jYWxTeW1ib2xzXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQWdDaGFydC51cGRhdGUodGhpcy5fY2hhcnQsIHRoaXMuYXBwbHlDb250YWluZXJJZk5vdFNldCh0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2hhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFydC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseUNvbnRhaW5lcklmTm90U2V0KHByb3BzT3B0aW9uczogQWdDaGFydE9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHByb3BzT3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wc09wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gey4uLnByb3BzT3B0aW9ucywgY29udGFpbmVyOiB0aGlzLl9uYXRpdmVFbGVtZW50fTtcbiAgICB9XG59XG4iXX0=
/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
// noinspection AngularIncorrectTemplateDefinition
export class AgChartsAngular {
    /**
     * @param {?} elementDef
     */
    constructor(elementDef) {
        this._initialised = false;
        this.options = {};
        this.onChartReady = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        /** @type {?} */
        const options = this.applyContainerIfNotSet(this.options);
        this.chart = AgChart.create(options);
        this._initialised = true;
        ((/** @type {?} */ (this.chart))).chart.waitForUpdate()
            .then((/**
         * @return {?}
         */
        () => {
            this.onChartReady.emit(this.chart);
        }));
    }
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (!this._initialised || !this.chart) {
            return;
        }
        AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this._initialised && this.chart) {
            this.chart.destroy();
            this.chart = undefined;
            this._initialised = false;
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
        return Object.assign(Object.assign({}, propsOptions), { container: this._nativeElement });
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
    options: [{ type: Input }],
    onChartReady: [{ type: Output }]
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
    /** @type {?} */
    AgChartsAngular.prototype.chart;
    /** @type {?} */
    AgChartsAngular.prototype.options;
    /** @type {?} */
    AgChartsAngular.prototype.onChartReady;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWFubGFuZHNtYW4vZGV2L2FnLWdyaWQvMjkuMy4wLzI5LjMuMS9jaGFydHMtY29tbXVuaXR5LW1vZHVsZXMvYWctY2hhcnRzLWFuZ3VsYXItbGVnYWN5L3Byb2plY3RzL2FnLWNoYXJ0cy1hbmd1bGFyL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hZy1jaGFydHMtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQWdCLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkgsT0FBTyxFQUFtQixPQUFPLEVBQWtCLE1BQU0scUJBQXFCLENBQUM7O0FBUS9FLE1BQU0sT0FBTyxlQUFlOzs7O0lBYXhCLFlBQVksVUFBc0I7UUFWMUIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFLdEIsWUFBTyxHQUFtQixFQUFFLENBQUM7UUFHN0IsaUJBQVksR0FBa0MsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUdwRSxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQzs7OztJQUVELGVBQWU7O2NBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpELElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUV6QixDQUFDLG1CQUFBLElBQUksQ0FBQyxLQUFLLEVBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7YUFDcEMsSUFBSTs7O1FBQUMsR0FBRyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsRUFBQyxDQUFDO0lBQ1gsQ0FBQzs7Ozs7O0lBR0QsV0FBVyxDQUFDLE9BQVk7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ25DLE9BQU87U0FDVjtRQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQzs7OztJQUVNLFdBQVc7UUFDZCxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQzs7Ozs7O0lBRU8sc0JBQXNCLENBQUMsWUFBNEI7UUFDdkQsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO1lBQ3hCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBRUQsdUNBQVcsWUFBWSxLQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFFO0lBQzdELENBQUM7OztZQXpESixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7YUFDeEM7Ozs7WUFUaUMsVUFBVTs7O3NCQWlCdkMsS0FBSzsyQkFHTCxNQUFNOzs7Ozs7O0lBUlAseUNBQTRCOzs7OztJQUM1Qix1Q0FBNkI7O0lBRTdCLGdDQUErQjs7SUFFL0Isa0NBQ29DOztJQUVwQyx1Q0FDd0UiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT3V0cHV0LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHsgQWdDaGFydEluc3RhbmNlLCBBZ0NoYXJ0LCBBZ0NoYXJ0T3B0aW9ucyB9IGZyb20gJ2FnLWNoYXJ0cy1jb21tdW5pdHknO1xuXG4vLyBub2luc3BlY3Rpb24gQW5ndWxhckluY29ycmVjdFRlbXBsYXRlRGVmaW5pdGlvblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1jaGFydHMtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdDaGFydHNBbmd1bGFyIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiBcbiAgICBwdWJsaWMgY2hhcnQ/OiBBZ0NoYXJ0SW5zdGFuY2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBvcHRpb25zOiBBZ0NoYXJ0T3B0aW9ucyA9IHt9O1xuXG4gICAgQE91dHB1dCgpXG4gICAgcHVibGljIG9uQ2hhcnRSZWFkeTogRXZlbnRFbWl0dGVyPEFnQ2hhcnRJbnN0YW5jZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5jaGFydCA9IEFnQ2hhcnQuY3JlYXRlKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgKHRoaXMuY2hhcnQgYXMgYW55KS5jaGFydC53YWl0Rm9yVXBkYXRlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2hhcnRSZWFkeS5lbWl0KHRoaXMuY2hhcnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gbm9pbnNwZWN0aW9uIEpTVW51c2VkR2xvYmFsU3ltYm9scyxKU1VudXNlZExvY2FsU3ltYm9sc1xuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpc2VkIHx8ICF0aGlzLmNoYXJ0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLmNoYXJ0LCB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQgJiYgdGhpcy5jaGFydCkge1xuICAgICAgICAgICAgdGhpcy5jaGFydC5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlDb250YWluZXJJZk5vdFNldChwcm9wc09wdGlvbnM6IEFnQ2hhcnRPcHRpb25zKSB7XG4gICAgICAgIGlmIChwcm9wc09wdGlvbnMuY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcHNPcHRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsuLi5wcm9wc09wdGlvbnMsIGNvbnRhaW5lcjogdGhpcy5fbmF0aXZlRWxlbWVudH07XG4gICAgfVxufVxuIl19
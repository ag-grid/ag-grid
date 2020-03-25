/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctY2hhcnRzLWFuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFnQixTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RixPQUFPLEVBQUMsT0FBTyxFQUFRLE1BQU0scUJBQXFCLENBQUM7O0FBUW5ELE1BQU0sT0FBTyxlQUFlOzs7O0lBV3hCLFlBQVksVUFBc0I7UUFSMUIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQzs7OztJQUVELGVBQWU7O2NBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDOzs7Ozs7SUFHRCxXQUFXLENBQUMsT0FBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7Ozs7SUFFTSxXQUFXO1FBQ2QsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7SUFDTCxDQUFDOzs7Ozs7SUFFTyxzQkFBc0IsQ0FBQyxZQUFpQjtRQUM1QyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCx5QkFBVyxZQUFZLElBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUU7SUFDN0QsQ0FBQzs7O1lBbERKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixRQUFRLEVBQUUsRUFBRTtnQkFDWixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN4Qzs7OztZQVRpQyxVQUFVOzs7c0JBa0J2QyxLQUFLOzs7Ozs7O0lBTk4seUNBQTRCOzs7OztJQUM1Qix1Q0FBNkI7Ozs7O0lBQzdCLHFDQUEyQjs7Ozs7SUFFM0IsaUNBQXVCOztJQUV2QixrQ0FDcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge0FnQ2hhcnQsIENoYXJ0fSBmcm9tICdhZy1jaGFydHMtY29tbXVuaXR5JztcblxuLy8gbm9pbnNwZWN0aW9uIEFuZ3VsYXJJbmNvcnJlY3RUZW1wbGF0ZURlZmluaXRpb25cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctY2hhcnRzLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnQ2hhcnRzQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9jaGFydCE6IENoYXJ0O1xuXG4gICAgQElucHV0KClcbiAgICBwdWJsaWMgb3B0aW9ucyE6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9jaGFydCA9IEFnQ2hhcnQuY3JlYXRlKG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgLy8gbm9pbnNwZWN0aW9uIEpTVW51c2VkR2xvYmFsU3ltYm9scyxKU1VudXNlZExvY2FsU3ltYm9sc1xuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIEFnQ2hhcnQudXBkYXRlKHRoaXMuX2NoYXJ0LCB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NoYXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhcnQuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlDb250YWluZXJJZk5vdFNldChwcm9wc09wdGlvbnM6IGFueSkge1xuICAgICAgICBpZiAocHJvcHNPcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzT3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7Li4ucHJvcHNPcHRpb25zLCBjb250YWluZXI6IHRoaXMuX25hdGl2ZUVsZW1lbnR9O1xuICAgIH1cbn1cbiJdfQ==
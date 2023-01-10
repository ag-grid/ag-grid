/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWFubGFuZHNtYW4vZGV2L2FnLWdyaWQvMjkuMC4wL2NoYXJ0cy1wYWNrYWdlcy9hZy1jaGFydHMtYW5ndWxhci1sZWdhY3kvcHJvamVjdHMvYWctY2hhcnRzLWFuZ3VsYXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2FnLWNoYXJ0cy1hbmd1bGFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0YsT0FBTyxFQUFtQixPQUFPLEVBQWtCLE1BQU0scUJBQXFCLENBQUM7O0FBUS9FLE1BQU0sT0FBTyxlQUFlOzs7O0lBV3hCLFlBQVksVUFBc0I7UUFSMUIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQzs7OztJQUVELGVBQWU7O2NBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDOzs7Ozs7SUFHRCxXQUFXLENBQUMsT0FBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7Ozs7SUFFTSxXQUFXO1FBQ2QsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDMUI7SUFDTCxDQUFDOzs7Ozs7SUFFTyxzQkFBc0IsQ0FBQyxZQUE0QjtRQUN2RCxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCx1Q0FBVyxZQUFZLEtBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUU7SUFDN0QsQ0FBQzs7O1lBbERKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixRQUFRLEVBQUUsRUFBRTtnQkFDWixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN4Qzs7OztZQVRpQyxVQUFVOzs7c0JBa0J2QyxLQUFLOzs7Ozs7O0lBTk4seUNBQTRCOzs7OztJQUM1Qix1Q0FBNkI7Ozs7O0lBQzdCLHFDQUEyQjs7Ozs7SUFFM0IsaUNBQWlDOztJQUVqQyxrQ0FDZ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ0NoYXJ0SW5zdGFuY2UsIEFnQ2hhcnQsIEFnQ2hhcnRPcHRpb25zIH0gZnJvbSAnYWctY2hhcnRzLWNvbW11bml0eSc7XG5cbi8vIG5vaW5zcGVjdGlvbiBBbmd1bGFySW5jb3JyZWN0VGVtcGxhdGVEZWZpbml0aW9uXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWNoYXJ0cy1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0NoYXJ0c0FuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcblxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfY2hhcnQhOiBBZ0NoYXJ0SW5zdGFuY2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBvcHRpb25zITogQWdDaGFydE9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2hhcnQgPSBBZ0NoYXJ0LmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHMsSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLl9jaGFydCwgdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5Q29udGFpbmVySWZOb3RTZXQocHJvcHNPcHRpb25zOiBBZ0NoYXJ0T3B0aW9ucykge1xuICAgICAgICBpZiAocHJvcHNPcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzT3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7Li4ucHJvcHNPcHRpb25zLCBjb250YWluZXI6IHRoaXMuX25hdGl2ZUVsZW1lbnR9O1xuICAgIH1cbn1cbiJdfQ==
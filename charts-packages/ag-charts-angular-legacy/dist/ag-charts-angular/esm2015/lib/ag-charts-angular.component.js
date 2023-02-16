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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9zZWFubGFuZHNtYW4vZGV2L2FnLWdyaWQvMjkuMS4wL2NoYXJ0cy1wYWNrYWdlcy9hZy1jaGFydHMtYW5ndWxhci1sZWdhY3kvcHJvamVjdHMvYWctY2hhcnRzLWFuZ3VsYXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2FnLWNoYXJ0cy1hbmd1bGFyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVuSCxPQUFPLEVBQW1CLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQzs7QUFRL0UsTUFBTSxPQUFPLGVBQWU7Ozs7SUFheEIsWUFBWSxVQUFzQjtRQVYxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUt0QixZQUFPLEdBQW1CLEVBQUUsQ0FBQztRQUc3QixpQkFBWSxHQUFrQyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3BFLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNuRCxDQUFDOzs7O0lBRUQsZUFBZTs7Y0FDTCxPQUFPLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFekQsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXpCLENBQUMsbUJBQUEsSUFBSSxDQUFDLEtBQUssRUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTthQUNwQyxJQUFJOzs7UUFBQyxHQUFHLEVBQUU7WUFDUCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxFQUFDLENBQUM7SUFDWCxDQUFDOzs7Ozs7SUFHRCxXQUFXLENBQUMsT0FBWTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbkMsT0FBTztTQUNWO1FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDOzs7O0lBRU0sV0FBVztRQUNkLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7U0FDN0I7SUFDTCxDQUFDOzs7Ozs7SUFFTyxzQkFBc0IsQ0FBQyxZQUE0QjtRQUN2RCxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCx1Q0FBVyxZQUFZLEtBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUU7SUFDN0QsQ0FBQzs7O1lBekRKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixRQUFRLEVBQUUsRUFBRTtnQkFDWixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN4Qzs7OztZQVRpQyxVQUFVOzs7c0JBaUJ2QyxLQUFLOzJCQUdMLE1BQU07Ozs7Ozs7SUFSUCx5Q0FBNEI7Ozs7O0lBQzVCLHVDQUE2Qjs7SUFFN0IsZ0NBQStCOztJQUUvQixrQ0FDb0M7O0lBRXBDLHVDQUN3RSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ0NoYXJ0SW5zdGFuY2UsIEFnQ2hhcnQsIEFnQ2hhcnRPcHRpb25zIH0gZnJvbSAnYWctY2hhcnRzLWNvbW11bml0eSc7XG5cbi8vIG5vaW5zcGVjdGlvbiBBbmd1bGFySW5jb3JyZWN0VGVtcGxhdGVEZWZpbml0aW9uXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWNoYXJ0cy1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0NoYXJ0c0FuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcblxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuIFxuICAgIHB1YmxpYyBjaGFydD86IEFnQ2hhcnRJbnN0YW5jZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG9wdGlvbnM6IEFnQ2hhcnRPcHRpb25zID0ge307XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25DaGFydFJlYWR5OiBFdmVudEVtaXR0ZXI8QWdDaGFydEluc3RhbmNlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNoYXJ0ID0gQWdDaGFydC5jcmVhdGUob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAodGhpcy5jaGFydCBhcyBhbnkpLmNoYXJ0LndhaXRGb3JVcGRhdGUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25DaGFydFJlYWR5LmVtaXQodGhpcy5jaGFydCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBub2luc3BlY3Rpb24gSlNVbnVzZWRHbG9iYWxTeW1ib2xzLEpTVW51c2VkTG9jYWxTeW1ib2xzXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGlzZWQgfHwgIXRoaXMuY2hhcnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEFnQ2hhcnQudXBkYXRlKHRoaXMuY2hhcnQsIHRoaXMuYXBwbHlDb250YWluZXJJZk5vdFNldCh0aGlzLm9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCAmJiB0aGlzLmNoYXJ0KSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseUNvbnRhaW5lcklmTm90U2V0KHByb3BzT3B0aW9uczogQWdDaGFydE9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHByb3BzT3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wc09wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gey4uLnByb3BzT3B0aW9ucywgY29udGFpbmVyOiB0aGlzLl9uYXRpdmVFbGVtZW50fTtcbiAgICB9XG59XG4iXX0=
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
import * as i0 from "@angular/core";
// noinspection AngularIncorrectTemplateDefinition
export class AgChartsAngular {
    constructor(elementDef) {
        this._initialised = false;
        this.options = {};
        this.onChartReady = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
    }
    ngAfterViewInit() {
        const options = this.applyContainerIfNotSet(this.options);
        this.chart = AgChart.create(options);
        this._initialised = true;
        this.chart.chart.waitForUpdate()
            .then(() => {
            this.onChartReady.emit(this.chart);
        });
    }
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    ngOnChanges(changes) {
        if (!this._initialised || !this.chart) {
            return;
        }
        AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
    }
    ngOnDestroy() {
        if (this._initialised && this.chart) {
            this.chart.destroy();
            this.chart = undefined;
            this._initialised = false;
        }
    }
    applyContainerIfNotSet(propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return Object.assign(Object.assign({}, propsOptions), { container: this._nativeElement });
    }
}
AgChartsAngular.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngular, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
AgChartsAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.17", type: AgChartsAngular, selector: "ag-charts-angular", inputs: { options: "options" }, outputs: { onChartReady: "onChartReady" }, usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-charts-angular',
                    template: '',
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }]; }, propDecorators: { options: [{
                type: Input
            }], onChartReady: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYWctY2hhcnRzLWFuZ3VsYXIvc3JjL2xpYi9hZy1jaGFydHMtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsWUFBWSxFQUFjLEtBQUssRUFBRSxNQUFNLEVBQXdCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNJLE9BQU8sRUFBbUIsT0FBTyxFQUFrQixNQUFNLHFCQUFxQixDQUFDOztBQUUvRSxrREFBa0Q7QUFNbEQsTUFBTSxPQUFPLGVBQWU7SUFheEIsWUFBWSxVQUFzQjtRQVYxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUt0QixZQUFPLEdBQW1CLEVBQUUsQ0FBQztRQUc3QixpQkFBWSxHQUFrQyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3BFLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNuRCxDQUFDO0lBRUQsZUFBZTtRQUNYLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXhCLElBQUksQ0FBQyxLQUFhLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTthQUNwQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELDBEQUEwRDtJQUMxRCxXQUFXLENBQUMsT0FBWTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbkMsT0FBTztTQUNWO1FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7U0FDN0I7SUFDTCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsWUFBNEI7UUFDdkQsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFO1lBQ3hCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBRUQsdUNBQVcsWUFBWSxLQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxJQUFFO0lBQzdELENBQUM7OzZHQXBEUSxlQUFlO2lHQUFmLGVBQWUseUpBSGQsRUFBRTs0RkFHSCxlQUFlO2tCQUwzQixTQUFTO21CQUFDO29CQUNQLFFBQVEsRUFBRSxtQkFBbUI7b0JBQzdCLFFBQVEsRUFBRSxFQUFFO29CQUNaLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN4QztpR0FTVSxPQUFPO3NCQURiLEtBQUs7Z0JBSUMsWUFBWTtzQkFEbEIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmLCBJbnB1dCwgT3V0cHV0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ0NoYXJ0SW5zdGFuY2UsIEFnQ2hhcnQsIEFnQ2hhcnRPcHRpb25zIH0gZnJvbSAnYWctY2hhcnRzLWNvbW11bml0eSc7XG5cbi8vIG5vaW5zcGVjdGlvbiBBbmd1bGFySW5jb3JyZWN0VGVtcGxhdGVEZWZpbml0aW9uXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWNoYXJ0cy1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0NoYXJ0c0FuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG5cbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcblxuICAgIHB1YmxpYyBjaGFydD86IEFnQ2hhcnRJbnN0YW5jZTtcblxuICAgIEBJbnB1dCgpXG4gICAgcHVibGljIG9wdGlvbnM6IEFnQ2hhcnRPcHRpb25zID0ge307XG5cbiAgICBAT3V0cHV0KClcbiAgICBwdWJsaWMgb25DaGFydFJlYWR5OiBFdmVudEVtaXR0ZXI8QWdDaGFydEluc3RhbmNlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmFwcGx5Q29udGFpbmVySWZOb3RTZXQodGhpcy5vcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNoYXJ0ID0gQWdDaGFydC5jcmVhdGUob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAodGhpcy5jaGFydCBhcyBhbnkpLmNoYXJ0LndhaXRGb3JVcGRhdGUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25DaGFydFJlYWR5LmVtaXQodGhpcy5jaGFydCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBub2luc3BlY3Rpb24gSlNVbnVzZWRHbG9iYWxTeW1ib2xzLEpTVW51c2VkTG9jYWxTeW1ib2xzXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGlzZWQgfHwgIXRoaXMuY2hhcnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEFnQ2hhcnQudXBkYXRlKHRoaXMuY2hhcnQsIHRoaXMuYXBwbHlDb250YWluZXJJZk5vdFNldCh0aGlzLm9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCAmJiB0aGlzLmNoYXJ0KSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseUNvbnRhaW5lcklmTm90U2V0KHByb3BzT3B0aW9uczogQWdDaGFydE9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHByb3BzT3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wc09wdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gey4uLnByb3BzT3B0aW9ucywgY29udGFpbmVyOiB0aGlzLl9uYXRpdmVFbGVtZW50fTtcbiAgICB9XG59XG4iXX0=
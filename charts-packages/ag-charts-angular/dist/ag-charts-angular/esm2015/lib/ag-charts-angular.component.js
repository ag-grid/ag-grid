import { Component, Input, ViewEncapsulation } from "@angular/core";
import { AgChart } from 'ag-charts-community';
import * as i0 from "@angular/core";
// noinspection AngularIncorrectTemplateDefinition
export class AgChartsAngular {
    constructor(elementDef) {
        this._initialised = false;
        this._destroyed = false;
        this._nativeElement = elementDef.nativeElement;
    }
    ngAfterViewInit() {
        const options = this.applyContainerIfNotSet(this.options);
        this._chart = AgChart.create(options);
        this._initialised = true;
    }
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    ngOnChanges(changes) {
        if (this._initialised) {
            AgChart.update(this._chart, this.applyContainerIfNotSet(this.options));
        }
    }
    ngOnDestroy() {
        if (this._initialised) {
            if (this._chart) {
                this._chart.destroy();
            }
            this._destroyed = true;
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
AgChartsAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.17", type: AgChartsAngular, selector: "ag-charts-angular", inputs: { options: "options" }, usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-charts-angular',
                    template: '',
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }]; }, propDecorators: { options: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctY2hhcnRzLWFuZ3VsYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYWctY2hhcnRzLWFuZ3VsYXIvc3JjL2xpYi9hZy1jaGFydHMtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQWMsS0FBSyxFQUF3QixpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVySCxPQUFPLEVBQW1CLE9BQU8sRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQzs7QUFFL0Usa0RBQWtEO0FBTWxELE1BQU0sT0FBTyxlQUFlO0lBV3hCLFlBQVksVUFBc0I7UUFSMUIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDbkQsQ0FBQztJQUVELGVBQWU7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUgsMERBQTBEO0lBQ3hELFdBQVcsQ0FBQyxPQUFZO1FBQ3BCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzFFO0lBQ0wsQ0FBQztJQUVNLFdBQVc7UUFDZCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDekI7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTyxzQkFBc0IsQ0FBQyxZQUE0QjtRQUN2RCxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCx1Q0FBVyxZQUFZLEtBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUU7SUFDN0QsQ0FBQzs7NkdBN0NRLGVBQWU7aUdBQWYsZUFBZSw4R0FIZCxFQUFFOzRGQUdILGVBQWU7a0JBTDNCLFNBQVM7bUJBQUM7b0JBQ1AsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsUUFBUSxFQUFFLEVBQUU7b0JBQ1osYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBQ3hDO2lHQVVVLE9BQU87c0JBRGIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7IEFnQ2hhcnRJbnN0YW5jZSwgQWdDaGFydCwgQWdDaGFydE9wdGlvbnMgfSBmcm9tICdhZy1jaGFydHMtY29tbXVuaXR5JztcblxuLy8gbm9pbnNwZWN0aW9uIEFuZ3VsYXJJbmNvcnJlY3RUZW1wbGF0ZURlZmluaXRpb25cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctY2hhcnRzLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnQ2hhcnRzQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfY2hhcnQhOiBBZ0NoYXJ0SW5zdGFuY2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHB1YmxpYyBvcHRpb25zITogQWdDaGFydE9wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2hhcnQgPSBBZ0NoYXJ0LmNyZWF0ZShvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG4gICAgfVxuXG4gIC8vIG5vaW5zcGVjdGlvbiBKU1VudXNlZEdsb2JhbFN5bWJvbHMsSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBBZ0NoYXJ0LnVwZGF0ZSh0aGlzLl9jaGFydCwgdGhpcy5hcHBseUNvbnRhaW5lcklmTm90U2V0KHRoaXMub3B0aW9ucykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYXJ0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGx5Q29udGFpbmVySWZOb3RTZXQocHJvcHNPcHRpb25zOiBBZ0NoYXJ0T3B0aW9ucykge1xuICAgICAgICBpZiAocHJvcHNPcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzT3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7Li4ucHJvcHNPcHRpb25zLCBjb250YWluZXI6IHRoaXMuX25hdGl2ZUVsZW1lbnR9O1xuICAgIH1cbn1cbiJdfQ==
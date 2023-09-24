import * as i0 from '@angular/core';
import { EventEmitter, Component, ViewEncapsulation, Input, Output, NgModule } from '@angular/core';
import { AgChart } from 'ag-charts-community';

// noinspection AngularIncorrectTemplateDefinition
class AgChartsAngular {
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

class AgChartsAngularModule {
}
AgChartsAngularModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngularModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AgChartsAngularModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngularModule, declarations: [AgChartsAngular], exports: [AgChartsAngular] });
AgChartsAngularModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngularModule, imports: [[]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgChartsAngularModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [AgChartsAngular],
                    imports: [],
                    exports: [AgChartsAngular]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { AgChartsAngular, AgChartsAngularModule };
//# sourceMappingURL=ag-charts-angular.js.map

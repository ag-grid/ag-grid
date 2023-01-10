import * as i0 from '@angular/core';
import { Component, ViewEncapsulation, Input, NgModule } from '@angular/core';
import { AgChart } from 'ag-charts-community';

// noinspection AngularIncorrectTemplateDefinition
class AgChartsAngular {
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

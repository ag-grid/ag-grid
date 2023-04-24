import { EventEmitter, Component, ViewEncapsulation, ElementRef, Input, Output, NgModule } from '@angular/core';
import { AgChart } from 'ag-charts-community';

/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// noinspection AngularIncorrectTemplateDefinition
class AgChartsAngular {
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

/**
 * @fileoverview added by tsickle
 * Generated from: lib/ag-charts-angular.module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class AgChartsAngularModule {
}
AgChartsAngularModule.decorators = [
    { type: NgModule, args: [{
                declarations: [AgChartsAngular],
                imports: [],
                exports: [AgChartsAngular]
            },] }
];

/**
 * @fileoverview added by tsickle
 * Generated from: public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: ag-charts-angular-legacy.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { AgChartsAngular, AgChartsAngularModule };
//# sourceMappingURL=ag-charts-angular-legacy.js.map

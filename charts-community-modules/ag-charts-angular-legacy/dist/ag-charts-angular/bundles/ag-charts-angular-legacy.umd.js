(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('ag-charts-community')) :
    typeof define === 'function' && define.amd ? define('ag-charts-angular-legacy', ['exports', '@angular/core', 'ag-charts-community'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ag-charts-angular-legacy'] = {}, global.ng.core, global.agCharts));
}(this, (function (exports, core, agChartsCommunity) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * Generated from: lib/ag-charts-angular.component.ts
     * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    // noinspection AngularIncorrectTemplateDefinition
    var AgChartsAngular = /** @class */ (function () {
        /**
         * @param {?} elementDef
         */
        function AgChartsAngular(elementDef) {
            this._initialised = false;
            this.options = {};
            this.onChartReady = new core.EventEmitter();
            this._nativeElement = elementDef.nativeElement;
        }
        /**
         * @return {?}
         */
        AgChartsAngular.prototype.ngAfterViewInit = function () {
            var _this = this;
            /** @type {?} */
            var options = this.applyContainerIfNotSet(this.options);
            this.chart = agChartsCommunity.AgChart.create(options);
            this._initialised = true;
            (( /** @type {?} */(this.chart))).chart.waitForUpdate()
                .then(( /**
         * @return {?}
         */function () {
                _this.onChartReady.emit(_this.chart);
            }));
        };
        // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
        /**
         * @param {?} changes
         * @return {?}
         */
        AgChartsAngular.prototype.ngOnChanges = function (changes) {
            if (!this._initialised || !this.chart) {
                return;
            }
            agChartsCommunity.AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
        };
        /**
         * @return {?}
         */
        AgChartsAngular.prototype.ngOnDestroy = function () {
            if (this._initialised && this.chart) {
                this.chart.destroy();
                this.chart = undefined;
                this._initialised = false;
            }
        };
        /**
         * @private
         * @param {?} propsOptions
         * @return {?}
         */
        AgChartsAngular.prototype.applyContainerIfNotSet = function (propsOptions) {
            if (propsOptions.container) {
                return propsOptions;
            }
            return Object.assign(Object.assign({}, propsOptions), { container: this._nativeElement });
        };
        return AgChartsAngular;
    }());
    AgChartsAngular.decorators = [
        { type: core.Component, args: [{
                    selector: 'ag-charts-angular',
                    template: '',
                    encapsulation: core.ViewEncapsulation.None
                }] }
    ];
    /** @nocollapse */
    AgChartsAngular.ctorParameters = function () { return [
        { type: core.ElementRef }
    ]; };
    AgChartsAngular.propDecorators = {
        options: [{ type: core.Input }],
        onChartReady: [{ type: core.Output }]
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
    var AgChartsAngularModule = /** @class */ (function () {
        function AgChartsAngularModule() {
        }
        return AgChartsAngularModule;
    }());
    AgChartsAngularModule.decorators = [
        { type: core.NgModule, args: [{
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

    exports.AgChartsAngular = AgChartsAngular;
    exports.AgChartsAngularModule = AgChartsAngularModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ag-charts-angular-legacy.umd.js.map
